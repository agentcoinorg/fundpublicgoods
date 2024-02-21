from fund_public_goods.db.app_db import load_env
from fund_public_goods.lib.strategy.utils.utils import get_latest_project_per_website
from langchain.text_splitter import CharacterTextSplitter
from fund_public_goods.db.tables.projects import get_all_projects_lightweight
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import Pinecone
from langchain.schema import Document


env = load_env()

def create_embeddings():
    projects = get_all_projects_lightweight()
    deduplicated_projects = get_latest_project_per_website(projects)
    
    text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=200,
        chunk_overlap=10,
        separator=" ",
        keep_separator=True
    )
    
    documents: list[Document] = []
    
    for project in deduplicated_projects:
        description_chunks = text_splitter.split_text(project.description)
        
        for description_chunk in description_chunks:
            doc = Document(page_content=description_chunk, metadata={
                "id": project.id,
            })
            
            documents.append(doc)
    
    vectorstore = Pinecone(
        index_name=env.pinecone_index,
        embedding=OpenAIEmbeddings(),
        pinecone_api_key=env.pinecone_key
    )
    
    try:
        vectorstore.delete(delete_all=True)
    except Exception():
        print("Pinecone index not found. Skipping deletion.")
    
    vectorstore.add_documents(documents)

create_embeddings()