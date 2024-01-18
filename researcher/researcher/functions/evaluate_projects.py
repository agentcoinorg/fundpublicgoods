
from chromadb import EphemeralClient
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import OpenAIEmbeddings
from researcher.functions.generate_queries import generate_queries
from researcher.models.project import Project
from langchain.vectorstores.chroma import Chroma
from researcher.models.project_evaluation import ProjectEvaluation
from pydantic import parse_obj_as


def stringify_projects(projects: list[Project], separator: str) -> str:
    project_strings = []

    for project in projects:
        project_str = get_project_text(project=project)
        project_strings.append(project_str)

    return separator.join(project_strings)

def get_project_text(project: Project) -> str:
    result = f"ID: {project.id} - Description: {project.description}\n"
        
    for answer in project.answers:
        result += f"  Question: {answer.question}\n"
        result += f"  Answer: {answer.answer}\n"
    
    return result

def remove_duplicate_projects(projects: list[Project]) -> list[Project]:
    seen = {}
    unique_projects = []

    for project in projects:
        if project.id not in seen:
            unique_projects.append(project)
            seen[project.id] = True

    return unique_projects

def get_top_matching_projects(prompt: str, projects: list[Project]) -> list[Project]:
    projects_by_id = {project.id: project for project in projects}
    queries = generate_queries(prompt=prompt, n=3)
    texts: list[str] = []
    metadatas: list[dict] = []
      
    for project in projects:
        project_text = get_project_text(project=project)
        texts.append(project_text)
        metadatas.append({ "id": project["id"] })
    
    db_client = EphemeralClient()
    collection = Chroma.from_texts(
        texts=texts,
        metadatas=metadatas,
        embedding=OpenAIEmbeddings(),
        client=db_client,
        collection_name="projects"
    )
        
    top_matches: list[Project] = []
    
    for query in queries:
        matches = collection.similarity_search(query, k=5)
        
        for match in matches:
            matched_project = projects_by_id[match.metadata["id"]]
            top_matches.append(matched_project)
            
    return remove_duplicate_projects(top_matches)

extract_evaluations_prompts_template = """
You will be given a list of project evaluations that measure how well each project
matches the user's interest, and its impact in regards to that interest.

You will return a list of the top projects the user should donate to. For a project to be
in the list, it must have:

- Impact score equal or greater than {impact_threshold}
- Interest score equal or greater than {interest_threshold}

You will return a single JSON array of JSON objects to be parsed by Python's "json.loads()":

[{
    project_id: project's id,
    reasoning: score reasoning,
    interest: interest score,
    impact: impact score,
}, ... ]

Do not include any other contents in your response. If no projects meet the aforementioned criteria
simply respond with an empty array: [].

Evaluations:

{evaluation_report}
"""

def extract_project_evaluations(evaluation_report: str) -> list[ProjectEvaluation]:
    extract_evaluations_prompt = ChatPromptTemplate.from_messages([
        ("system", extract_evaluations_prompts_template),
    ])
    
    llm = ChatOpenAI(model="gpt-4-1106-preview")
    
    evaluations_extraction_chain = extract_evaluations_prompt | llm | StrOutputParser()
    
    raw_evaluations = evaluations_extraction_chain.invoke({
        "impact_threshold": "0.2",
        "interest_threshold": "0.4",
        "evaluation_report": evaluation_report
    })
    
    print(raw_evaluations)
    
    evaluations = parse_obj_as(list[ProjectEvaluation], raw_evaluations)
    
    return evaluations
    
    

evaluation_prompt_template = """
You are a professional public goods funding projects evaluator.

You will receive a list of project information abstracts divided by '{separator}'
and you will assess:

- How well each project matches the user's interest. Provide a floating point numeric score
from 0 to 10.
- How much has this project impacted the user's interest. Provide a floating point numeric score
from 0 to 10.

You will provide clear reasoning for each. You will include the ID of each project.

User's interest: {prompt}

Projects: {projects}
"""

def evaluate_projects(prompt: str, projects: list[Project]):
    top_matching_projects = get_top_matching_projects(prompt=prompt, projects=projects)
    
    evaluation_prompt = ChatPromptTemplate.from_messages([
        ("system", evaluation_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-4-1106-preview")

    evaluation_chain = evaluation_prompt | llm | StrOutputParser()
    
    separator = "\n-----\n"

    evaluation_report = evaluation_chain.invoke({
        "prompt": prompt,
        "separator": separator,
        "projects": stringify_projects(projects=top_matching_projects, separator=separator)
    })
    
    print(evaluation_report)
    
    evaluations = extract_project_evaluations(evaluation_report=evaluation_report)
    
    print(evaluations)
    