from fund_public_goods.lib.strategy.utils.constants import PROJECT_CATEGORIES
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


categorize_prompt_template = """
Your goal is to categorize a project according to it's description. These are the existing categories:

{categories}

Consider that all projects are within the blockchain ecosystem and seeking public goods funding.
A project can have multiple categories. Be strict with assigning categories.

Respond strictly with a comma-separated list of categories, without quotes. Do not change the wording
or casing of the categories, return them exactly as they are written in the list above.

Some projects's descriptions will not have sufficient information to be categorized, even in a single category,
if that's the case, simply respond "NONE" (without quotes)

Project description:
{project_description}
"""


def categorize_project(project_descriptions: list[str]) -> list[list[str]]:
    categorize_prompt = ChatPromptTemplate.from_messages([
        ("system", categorize_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    categorize_chain = categorize_prompt | llm | StrOutputParser()

    category_strings = categorize_chain.batch([{
        "project_description": project_description,
        "categories": "\n".join(f"- {category}" for category in PROJECT_CATEGORIES)
    } for project_description in project_descriptions])
    
    categories: list[list[str]] = []
    
    for category_string in category_strings:
        if category_string == "NONE":
            categories.append([])
        else:
            categories.append([category.strip() for category in category_string.split(",")])
            
    return categories