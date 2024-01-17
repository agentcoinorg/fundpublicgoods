
from chromadb import chromadb
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import OpenAIEmbeddings
from researcher.functions.generate_queries import generate_queries
from researcher.models.project import Project
from langchain.vectorstores.chroma import Chroma
from langchain_core.documents import Document

def stringify_projects(projects: list[Project], separator: str) -> str:
    project_strings = []

    for project in projects:
        project_str = get_project_text(project=project)
        project_strings.append(project_str)

    return separator.join(project_strings)

def get_project_text(project: Project) -> str:
    result = f"Project Description: {project.description}\n"
        
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
    queries = generate_queries(prompt=prompt, n=3)
    
    documents: list[Document] = []
      
    for project in projects:
        project_text = get_project_text(project=project)
        documents.append(
            Document(page_content=project_text, metadata=project.model_dump())
        )
        
    collection = Chroma.from_documents(
        documents=documents,
        embeddings=OpenAIEmbeddings(),
        client=chromadb.EphemeralClient()
        collection_name="projects"
    )
    
    top_matches: list[Project] = []
    
    for query in queries:
        matches = collection.similarity_search(query, k=5)
        
        for match in matches:
            matched_project = Project(**match.metadata)
            top_matches.append(matched_project)
            
    return remove_duplicate_projects(top_matches)

extract_evaluations_prompt_template = """
You will be given a list of project evaluations that measure how well each project
matches the user's interest, and its impact in regards to that interest.

You will return a list of the top projects the user should donate to. This list will have a
max length of {n} items.
"""

evaluation_prompt_template = """
You are a professional public goods funding projects evaluator.

You will receive a list of project information abstracts divided by '{separator}'
and you will assess:

- How well each project matches the user's interest.
- How much has this project impacted the user's interest

You will provide clear reasoning for each.

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

    evaluation = evaluation_chain.invoke({
        "prompt": prompt,
        "separator": separator,
        "projects": stringify_projects(projects=projects, separator=separator)
    })
    