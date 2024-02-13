from fund_public_goods.workflows.egress_gitcoin.upsert import sanitize_url
from langchain.text_splitter import SentenceTransformersTokenTextSplitter

from chromadb import EphemeralClient
from fund_public_goods.lib.strategy.models.project import Project
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from fund_public_goods.lib.strategy.utils.utils import stringify_projects
from fund_public_goods.lib.strategy.utils.strings_to_numbers import strings_to_numbers
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores.chroma import Chroma


reranking_prompt_template = """
You are tasked as a specialist in evaluating public goods projects.
Your role involves analyzing a collection of project summaries provided to you.
These summaries are separated by '{separator}'.
Your main objective is to rearrange these summaries in a sequence that accurately reflects their relevance to a given user's prompt.

Your deliverable is a list of PROJECT_IDs in descending order of their relevance to the user's prompt,
formatted as a comma-separated list without any quotation marks.
It is crucial to return these PROJECT_IDs exactly as they appear, with no modifications.

In your assessment, it is essential to discern the genuine alignment of each project with the user's specific requirements.
Be mindful that the project descriptions may include buzzwords or jargon intended to exaggerate their relevance.
Your judgment should penetrate beyond superficial claims to identify projects that truly resonate with the user's prompt.
For instance, in response to a prompt for 'ethereum developer tooling,'
prioritize projects that contribute directly to ethereum SDKs over those merely organizing ethereum-related events.

User's prompt: {prompt}

Projects: {projects}

Your response should consist solely of the Project IDs, arranged from the most to the least relevant, based on your expert evaluation.
"""

def rerank_top_projects(prompt: str, projects: list[Project]) -> list[Project]:
    
    reranking_prompt = ChatPromptTemplate.from_messages([
        ("system", reranking_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    reranking_chain = reranking_prompt | llm | StrOutputParser()
    
    separator = "\n-----\n"
    
    top_ids_res = reranking_chain.invoke({
        "prompt": prompt,
        "separator": separator,
        "projects": stringify_projects(projects=projects, separator=separator)
    })
    top_ids_split = top_ids_res.split(',')
    top_ids = strings_to_numbers(top_ids_split)
    reranked_projects: list[Project] = []

    for i in range(len(top_ids)):
        id = top_ids[i]
        if id is None:
            raise Exception(
                f"The LLM has responded with a non-number at index {i}. Llm response ({top_ids_res}). Response split ({top_ids_split})"
            )
        if id > len(projects) or id < 0:
            raise Exception(
                f"ID {id} not found in projects array (len {len(projects)}). Llm response ({top_ids_res}). Response split ({top_ids_split})"
            )
        reranked_projects.append(projects[id])

    return reranked_projects

def get_top_n_unique_ids(data: dict[str, list[str]], n: int) -> list[str]:
    unique_ids = set()
    result_ids: list[str] = []
    query_order = list(data.keys())
    max_length = max(len(ids) for ids in data.values())
    
    for i in range(max_length):
        for query in query_order:
            if len(result_ids) >= n:
                break
            ids = data[query]
            if i < len(ids) and ids[i] not in unique_ids:
                unique_ids.add(ids[i])
                result_ids.append(ids[i])
                
        if len(result_ids) >= n:
            break
    
    return result_ids

def deduplicate_projects_by_website(projects: list[Project]) -> list[Project]:
    unique_websites: dict[str, Project] = {}
    for project in projects:
        sanitized_website = sanitize_url(project.website)
        if sanitized_website not in unique_websites.keys():
            unique_websites[sanitized_website] = project
    return list(unique_websites.values())


def create_embeddings_collection(projects: list[Project]):
    text_splitter = SentenceTransformersTokenTextSplitter()
    
    texts: list[str] = []
    metadatas: list[dict] = []
      
    for project in projects:
        description_chunks = text_splitter.split_text(project.description)
        
        for description_chunk in description_chunks:
            texts.append(description_chunk)
            metadatas.append({ "id": project["id"], "title": project["title"] })
    
    db_client = EphemeralClient()
    collection = Chroma.from_texts(
        texts=texts,
        metadatas=metadatas,
        embedding=OpenAIEmbeddings(),
        client=db_client,
        collection_name="projects"
    )
    
    return collection


def get_top_matching_projects(prompt: str, projects: list[Project]) -> list[Project]:
    deduplicated = deduplicate_projects_by_website(projects)
    projects_by_id = {project.id: project for project in deduplicated}

    queries = [prompt]
    all_projects_collection = create_embeddings_collection(deduplicated)
    
    query_to_matched_project_ids: dict[str, list[str]] = {}
    
    for query in queries:
        matches = all_projects_collection.similarity_search(query, k=200)
        query_to_matched_project_ids[query] = [match.metadata["id"] for match in matches]
        
    unique_ids = get_top_n_unique_ids(query_to_matched_project_ids, 30)
    
    matched_projects = [projects_by_id[id] for id in unique_ids]
            
    reranked_projects = rerank_top_projects(prompt=prompt, projects=matched_projects)
    
    return reranked_projects