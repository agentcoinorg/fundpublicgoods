import subprocess
import sys
import re
from omymodels import create_models

def add_class_config(input_text):
    # Regex pattern to match class definitions
    class_pattern = r"(class\s+\w+\(BaseModel\):)([\s\S]+?)(\n\n|\Z)"
    replacement = r"\1\2\n\n    model_config = ConfigDict(\n        populate_by_name=True\n    )\3"
    return re.sub(class_pattern, replacement, input_text)

def snake_to_camel(snake_str):
    components = snake_str.split('_')
    # Capitalize the first letter of each component except the first one
    # and join them together.
    return components[0] + ''.join(x.title() for x in components[1:])

def add_alias_no_default(input_text):
    # Regex pattern to match properties without a default value
    property_pattern = r"(\s+)(\w+_\w+)(:\s+\w+)\s*\n"
    def edit(match):
        name, type_def = match.group(2), match.group(3)
        camel_case = snake_to_camel(name)
        return f"{match.group(1)}{name}{type_def} = Field(..., alias=\"{camel_case}\")\n"
    return re.sub(property_pattern, edit, input_text)

def add_alias_with_default(input_text):
    # Regex pattern to match properties with a default value
    property_with_default_pattern = r"(\s+)(\w+_\w+)(:\s+Optional\[\w+\.?\w*\]\s*=\s*None)\n"
    def edit(match):
        name, type_def = match.group(2), match.group(3)
        # Extract the type without Optional and the default value
        type_only = re.search(r'Optional\[(\w+\.?\w*)\]', type_def).group(1)
        camel_case = snake_to_camel(name)
        return f"{match.group(1)}{name}: Optional[{type_only}] = Field(default=None, alias=\"{camel_case}\")\n"
    return re.sub(property_with_default_pattern, edit, input_text)

def run():
    # Run `supabase db dump --local` to get the db schema
    result = subprocess.run(
        ["npx", "supabase", "db", "dump", "--local"],
        capture_output=True,
        cwd="../web"
    )
    if result.returncode != 0:
        print("Failed to run 'supabase db dump --local'")
        print(result.stderr.decode())
        sys.exit(1)

    db_schema = result.stdout.decode()

    # Split the schema by statement (ending in ;)
    statements = [stmt.strip() for stmt in db_schema.split(';')]
    # Extract only the "CREATE TABLE" statements
    create_table_statements = [stmt + ';' for stmt in statements if stmt.strip().startswith('CREATE TABLE IF NOT EXISTS "public".')]
    create_table_statements = [stmt.replace('CREATE TABLE IF NOT EXISTS "public".', 'CREATE TABLE ') for stmt in create_table_statements]
    # Remove some unsupported SQL features that break omymodels
    create_table_statements = [stmt.replace('DEFAULT "gen_random_uuid"() NOT NULL', '') for stmt in create_table_statements]
    create_table_statements = [stmt.replace('with time zone DEFAULT "now"() NOT NULL', '') for stmt in create_table_statements]
    create_table_statements = [re.sub(r'(?m)CONSTRAINT.*\n?', '', stmt) for stmt in create_table_statements]
    db_schema = '\n\n'.join(create_table_statements)

    # Generate pydantic types using omymodels
    types = create_models(db_schema, models_type="pydantic")["code"]

    # Convert "= false" and "= true" to proper Python
    types = re.sub(r'= false', '= False', types)
    types = re.sub(r'= true', '= Talse', types)

    # Default Optional types = None
    types = re.sub(r'Optional\[(.*?)\]', r'Optional[\1] = None', types)

    # Add aliases for all snake case classes
    types = add_class_config(types)
    types = add_alias_no_default(types)
    types = add_alias_with_default(types)
    types = types.replace("from pydantic import BaseModel, Json", "from pydantic import BaseModel, Json, Field, ConfigDict")

    # Write the types to a file
    with open("../workers/fund_public_goods/db/entities.py", "w") as file:
        file.write(types)

    sys.exit(0)
