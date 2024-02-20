import json
from langchain.text_splitter import CharacterTextSplitter

from chromadb import EphemeralClient
from langchain.text_splitter import CharacterTextSplitter
from fund_public_goods.db.entities import Projects
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores.chroma import Chroma
import openai


reranking_prompt_template = """
You are tasked as a specialist in evaluating public goods projects.
Your role involves analyzing a collection of project descriptions provided to you.
These descriptions are separated by '{separator}'.
Your main objective is to rearrange these projects in a sequence that accurately reflects their relevance to a given user's prompt.

Your deliverable is a list of IDs in descending order of their relevance to the user's prompt,
formatted as a comma-separated list without any quotation marks.
It is crucial to return these IDs exactly as they appear, with no modifications.

You will return a JSON object with the following format:
'''
{{
    "project_ids": number[]
}}
'''

Example response:
'''
{{
    "project_ids": [32, 25, 4, 8]
}}
'''

In your assessment, it is essential to discern the genuine alignment of each project with the user's specific requirements.
Be mindful that the project descriptions may include buzzwords or jargon intended to exaggerate their relevance.
Your judgment should penetrate beyond superficial claims to identify projects that truly resonate with the user's prompt.
For instance, in response to a prompt for 'ethereum developer tooling,'
prioritize projects that contribute directly to ethereum SDKs over those merely organizing ethereum-related events.

User's prompt: {prompt}

Projects: {projects}
"""

def rerank_top_projects(prompt: str, projects: list[Projects]) -> list[Projects]:
    separator = "\n-----\n"
    formatted_projects = separator.join([
        f"ID: {i} - Description: {projects[i].description}\n"
        for i in range(len(projects))
    ])
    formatted_prompt = reranking_prompt_template.format(prompt=prompt, separator=separator, projects=formatted_projects)
    
    response = openai.chat.completions.create(
        model="gpt-4-1106-preview",
        response_format={"type": "json_object"},
        messages=[
            {"role": "user", "content": formatted_prompt}
        ]
    )
    
    raw_response = str(response.choices[0].message.content)
    json_response = json.loads(raw_response)
    top_ids = json_response['project_ids']
    reranked_projects: list[Projects] = []

    for i in range(len(top_ids)):
        id = top_ids[i]
        if id is None:
            raise Exception(
                f"The LLM has responded with a non-number at index {i}. Llm response ({json_response}). RAW response ({raw_response})"
            )
        if id > len(projects) or id < 0:
            raise Exception(
                f"ID {id} not found in projects array (len {len(projects)}). Llm response ({json_response}). RAW response ({raw_response})"
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


def create_embeddings_collection(projects: list[Projects]):
    text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=200,
        chunk_overlap=10,
        separator=" ",
        keep_separator=True
    )
    
    texts: list[str] = []
    metadatas: list[dict] = []
    
    for project in projects:
        description_chunks = text_splitter.split_text(project.description)
        
        for description_chunk in description_chunks:
            texts.append(description_chunk)
            metadatas.append({ "id": project.id, "title": project.title })
    
    db_client = EphemeralClient()
    collection = Chroma.from_texts(
        texts=texts,
        metadatas=metadatas,
        embedding=OpenAIEmbeddings(),
        client=db_client,
        collection_name="projects"
    )
    
    return collection


def get_top_matching_projects(prompt: str, projects: list[Projects]) -> list[Projects]:
    projects_by_id = {project.id: project for project in projects}
    all_projects_collection = create_embeddings_collection(projects)
    matches = all_projects_collection.similarity_search(prompt, k=300)
    matched_project_ids = [match.metadata["id"] for match in matches]
    unique_ids = get_top_n_unique_ids({prompt: matched_project_ids}, 30)
    
    matched_projects = []

    # TODO: this is a patch for an error seen in prod, should look at why
    #       some of these IDs don't exist...
    for id in unique_ids:
        if projects_by_id.get(id):
            matched_projects.append(projects_by_id[id])
    
    reranked_projects = rerank_top_projects(prompt=prompt, projects=matched_projects)
    
    return reranked_projects