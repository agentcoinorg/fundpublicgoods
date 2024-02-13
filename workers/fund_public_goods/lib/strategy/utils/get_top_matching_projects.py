from chromadb import EphemeralClient
from fund_public_goods.db.entities import Projects
from fund_public_goods.lib.strategy.models.answer import Answer
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from fund_public_goods.lib.strategy.utils.utils import get_project_text, stringify_projects
from fund_public_goods.lib.strategy.utils.generate_queries import generate_queries
from fund_public_goods.lib.strategy.utils.strings_to_numbers import strings_to_numbers
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores.chroma import Chroma


reranking_prompt_template = """
You are a professional public goods projects evaluator.

You will receive a list of project information abstracts divided by '{separator}'
and you will reorder them based on how much they relate to the user's prompt.

You will return a comma-seaparted list of PROJECT_IDs, without quotes.
PROJECT_IDs are as specified, **do not** modify in any way,
return them exactly as written.

Ranked from best matching to worst matching.

Consider that each project's information is self reported, it may include buzzwords to seem
relevant, but in reality it isn't.

User's prompt: {prompt}

Projects: {projects}

Return the Project's ID and only the IDs, separated by commas.
"""

def rerank_top_projects(prompt: str, projects: list[tuple[Projects, list[Answer]]]) -> list[tuple[Projects, list[Answer]]]:
    
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
    reranked_projects: list[tuple[Projects, list[Answer]]] = []

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

def get_top_matching_projects(prompt: str, projects_with_answers: list[tuple[Projects, list[Answer]]]) -> list[tuple[Projects, list[Answer]]]:
    projects_by_id = {project_with_answers[0].id: project_with_answers for project_with_answers in projects_with_answers}
    queries = [prompt] + generate_queries(prompt=prompt, n=3)
    
    texts: list[str] = []
    metadatas: list[dict] = []
      
    for (project, _) in projects_with_answers:
        project_text = f"ID: {project.id} - Description: {project.description}\n"
        texts.append(project_text)
        metadatas.append({ "id": project.id })
    
    db_client = EphemeralClient()
    collection = Chroma.from_texts(
        texts=texts,
        metadatas=metadatas,
        embedding=OpenAIEmbeddings(),
        client=db_client,
        collection_name="projects"
    )
    
    query_to_matched_project_ids: dict[str, list[str]] = {}
    
    for query in queries:
        matches = collection.similarity_search(query, k=100)
        query_to_matched_project_ids[query] = [match.metadata["id"] for match in matches]
    
    unique_ids = get_top_n_unique_ids(query_to_matched_project_ids, 30)
    
    matched_projects = []

    # TODO: this is a patch for an error seen in prod, should look at why
    #       some of these IDs don't exist...
    for id in unique_ids:
        if projects_by_id.get(id):
            matched_projects.append(projects_by_id[id])
    
    reranked_projects = rerank_top_projects(prompt=prompt, projects=matched_projects)
    
    return reranked_projects