from fund_public_goods.db.app_db import load_env
from fund_public_goods.db.entities import Projects
from fund_public_goods.db.tables.projects import fetch_projects_data
from langchain.schema import Document

from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import Pinecone


text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=200,
    chunk_overlap=10,
    separator=" ",
    keep_separator=True
)


def create_docs_from_projects(projects: list[Projects]) -> list[Document]:
    documents: list[Document] = []
    
    for project in projects:
        chunks = text_splitter.split_text(project.description)
        metadatas = [{
            "id": project.id,
            "categories": project.categories,
            "keywords": project.keywords,
            "title": project.title,
            "website": project.website
        } for _ in chunks]
        
        documents += [Document(
        page_content=chunks[i],
        metadata=metadatas[i]
        ) for i in range(len(chunks))]
        
    return documents

def upload_documents_to_pinecone(documents: list[Document]):
    env = load_env()
    embeddings = OpenAIEmbeddings()
    vectorstore = Pinecone(index_name=env.pinecone_index_name, embedding=embeddings)
    
    vectorstore.delete(delete_all=True)
    vectorstore.add_documents(documents)
    

def generate_pinecone_embeddings():
    projects = [project for (project, _) in fetch_projects_data()]
    documents = create_docs_from_projects(projects)
    
    upload_documents_to_pinecone(documents)