from fund_public_goods.lib.strategy.models.project import Project
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser


summarize_prompt_template = """
You will be given a description of a project. Your objective is to
summarize it into a single line.

Only state the summarized description and nothing else.

Description: {description}
"""


def summarize_descriptions(projects: list[Project]) -> list[Project]:
    summarize_prompt = ChatPromptTemplate.from_messages([
        ("system", summarize_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-3.5-turbo-0125") # type: ignore

    summarize_chain = summarize_prompt | llm | StrOutputParser()

    summarized_descriptions = summarize_chain.batch([{
        "description": project.description
    } for project in projects])
    
    projects_with_summaries = [Project(
        **projects[i].model_dump(),
        shortDescription=summarized_descriptions[i]
    ) for i in range(len(summarized_descriptions))]
    
    return projects_with_summaries