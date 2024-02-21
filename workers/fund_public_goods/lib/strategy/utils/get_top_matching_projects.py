import json
from fund_public_goods.db.app_db import load_env
from fund_public_goods.db.tables.projects import get_projects_by_ids
from fund_public_goods.lib.strategy.models.answer import Answer

from fund_public_goods.db.entities import Projects
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import Pinecone
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

def remove_duplicates_and_preserve_order(lst: list[str]) -> list[str]:
    seen = set()
    result = []
    for item in lst:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


def get_top_matching_projects(prompt: str) -> list[Projects]:
    env = load_env()
    vectorstore = Pinecone(
        index_name=env.pinecone_index,
        embedding=OpenAIEmbeddings(),
        pinecone_api_key=env.pinecone_key
    )
    
    target_unique_ids = 35
    total_unique_ids: list[str] = []
    
    while (len(total_unique_ids) < target_unique_ids):
        matches = vectorstore.similarity_search(query=prompt, k=300, filter={"id": { "$nin": total_unique_ids }})
        query_to_matched_project_ids = [match.metadata["id"] for match in matches]
        
        total_unique_ids += remove_duplicates_and_preserve_order(query_to_matched_project_ids)
    
    matched_projects: list[tuple[Projects, list[Answer]]] = get_projects_by_ids(total_unique_ids[:target_unique_ids])
    
    reranked_projects = rerank_top_projects(prompt=prompt, projects=[p for (p, _) in matched_projects])
    
    return reranked_projects