from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from fund_public_goods.db import indexes, tables
from fund_public_goods.lib.strategy.utils.generate_queries import generate_queries
from fund_public_goods.lib.strategy.utils.strings_to_numbers import strings_to_numbers

reranking_prompt_template = """
You are a professional public goods projects evaluator.

You will receive a list of project information abstracts divided by '{separator}'
and you will reorder them based on how much they relate to the user's prompt.

You will return a comma-seaparted list of PROJECT_IDs, without quotes.
PROJECT_IDs are as specified, **do not** modify in any way,
return them exactly as written.

Ranked from best matching to worst matching.

User's prompt: {prompt}

Projects: {projects}
"""

def rerank_top_projects(prompt: str, project_ids_with_description: list[tuple[str, str]]) -> list[str]:
    
    reranking_prompt = ChatPromptTemplate.from_messages([
        ("system", reranking_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    reranking_chain = reranking_prompt | llm | StrOutputParser()
    
    separator = "\n-----\n"
    
    top_ids_res = reranking_chain.invoke({
        "prompt": prompt,
        "separator": separator,
        "projects": separator.join([
            f"ID: {i} - Description: {project_ids_with_description[i][1]}\n"
            for i in range(len(project_ids_with_description))
        ])
    })
    top_ids_split = top_ids_res.split(',')
    top_ids = strings_to_numbers(top_ids_split)
    reranked_project_ids: list[str] = []

    for i in range(len(top_ids)):
        id = top_ids[i]
        if id is None:
            raise Exception(
                f"The LLM has responded with a non-number at index {i}. Llm response ({top_ids_res}). Response split ({top_ids_split})"
            )
        if id > len(project_ids_with_description) or id < 0:
            raise Exception(
                f"ID {id} not found in projects array (len {len(project_ids_with_description)}). Llm response ({top_ids_res}). Response split ({top_ids_split})"
            )
        reranked_project_ids.append(project_ids_with_description[id][0])

    return reranked_project_ids


def get_top_matching_projects(prompt: str) -> list[str]:
    queries = generate_queries(prompt=prompt, n=5)
    
    top_ids: list[str] = []
    
    for query in queries:
        matches = indexes.projects.query(query, k=5).matches
        """
        sort by score (highest first):
        [{ id: "project_id/chunk_0", score }]
        """

        for match in matches:
            top_ids.append(match.id.split("/")[0])
    
    unique_ids = list(set(top_ids))
    projects = tables.projects.get_slim(unique_ids)
    reranked_project_ids = rerank_top_projects(prompt, projects)
    
    return reranked_project_ids
