from chromadb import EphemeralClient
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.utils.generate_queries import generate_queries
from fund_public_goods.lib.strategy.utils.utils import get_project_text, remove_duplicate_projects
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores.chroma import Chroma


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