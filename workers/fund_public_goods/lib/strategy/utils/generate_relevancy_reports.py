from fund_public_goods.db.entities import Projects
from fund_public_goods.lib.strategy.models.answer import Answer
from fund_public_goods.lib.strategy.utils.utils import get_project_text
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


reports_prompt_template = """

As a professional evaluator of public goods projects, your task involves analyzing project information to prepare a
concise report on relevance. Assess how closely a project aligns with the user's prompt,
critically examining the project description for genuine relevance versus promotional language.
Identify key points of alignment, discrepancies, and provide a rationale for the degree of match.

Your objective is to critically sift through self-reported data to determine project alignment with user interests.

User's prompt: {prompt}

Project: {project}

Your output should be in markdown format with the following structure:

## Relevance

{{ Your output goes here}}

"""

def generate_relevancy_reports(prompt: str, projects: list[tuple[Projects, list[Answer]]]) -> list[str]:
    reports_prompt = ChatPromptTemplate.from_messages([
        ("system", reports_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-3.5-turbo-0125", max_tokens=250)

    reports_chain = (
        reports_prompt |
        llm |
        StrOutputParser()
    )
    
    reports_reports = reports_chain.batch([{
        "prompt": prompt,
        "project": get_project_text(project)
    } for project in projects])
        
    return reports_reports
