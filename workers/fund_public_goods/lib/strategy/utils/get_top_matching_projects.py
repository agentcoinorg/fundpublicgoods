from chromadb import EphemeralClient
from fund_public_goods.lib.strategy.models.project import Project
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from fund_public_goods.lib.strategy.utils.utils import stringify_projects
from fund_public_goods.lib.strategy.utils.generate_queries import generate_queries
from fund_public_goods.lib.strategy.utils.utils import get_project_text, remove_duplicate_projects
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores.chroma import Chroma


reranking_prompt_template = """
You are a professional public goods projects evaluator.

You will receive a list of project information abstracts divided by '{separator}'
and you will reorder them based on how much they relate to the user's prompt.

You will return a comma-seaparted list of project IDs, without quotes.
Ranked from best matching to worst matching.

User's prompt: {prompt}

Projects: {projects}
"""

def rerank_top_projects(prompt: str, projects: list[Project]) -> list[Project]:
    projects_by_id = {project.id: project for project in projects}
    
    reranking_prompt = ChatPromptTemplate.from_messages([
        ("system", reranking_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    reranking_chain = reranking_prompt | llm | StrOutputParser()
    
    separator = "\n-----\n"
    
    top_ids = reranking_chain.invoke({
        "prompt": prompt,
        "separator": separator,
        "projects": stringify_projects(projects=projects, separator=separator)
    }).split(',')
    
    reranked_projects: list[Project] = [projects_by_id[id] for id in top_ids]
    
    return reranked_projects


def get_top_matching_projects(prompt: str, projects: list[Project]) -> list[Project]:
    projects_by_id = {project.id: project for project in projects}
    queries = generate_queries(prompt=prompt, n=5)
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
            
    unique_projects = remove_duplicate_projects(top_matches)
    reranked_projects = rerank_top_projects(prompt=prompt, projects=unique_projects)
    
    return reranked_projects