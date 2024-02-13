from fund_public_goods.db.entities import Projects
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


keywords_prompt_template = """
Your goal is to provide a list of broad and insightful labels (at most 8) based on a projects' description.
If there isn't enough information, then simply don't generate as many labels. Avoid too general and too basic
labels like 'blockchain', 'opportunity', etc. Also avoid just using the project's name directly.

All projects are looking for public goods funding, so the labels should be about the project and not fundraising
per se; unless the project is explicitly about fundraising.

Respond strictly with a comma-separated list of labels, without quotes. If no labels, simply respond with "NONE" (without quotes)

Project:

{project_description}
"""


def generate_keywords(project_description: str) -> list[str]:
    keywords_prompt = ChatPromptTemplate.from_messages([
        ("system", keywords_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    keywords_chain = keywords_prompt | llm | StrOutputParser()

    keywords = keywords_chain.invoke({
        "project_description": project_description
    })
    
    if keywords == "NONE":
        return []
    
    return [keyword.strip() for keyword in keywords.split(",")]