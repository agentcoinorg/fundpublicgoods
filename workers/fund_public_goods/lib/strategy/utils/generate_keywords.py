from fund_public_goods.db.entities import Projects
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import CommaSeparatedListOutputParser


keywords_prompt_template = """
Your goal is to provide a list of 8 labels or keyword based on a projects' description.

Project: {project_description}

Respond strictly with a comma-separated list of keywords, without quotes
"""


def generate_keywords(project_description: str) -> list[str]:
    keywords_prompt = ChatPromptTemplate.from_messages([
        ("system", keywords_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    keywords_chain = keywords_prompt | llm | CommaSeparatedListOutputParser()

    keywords = keywords_chain.invoke({
        "project_description": project_description
    })
    
    return keywords