from fund_public_goods.db.entities import Projects
from fund_public_goods.lib.strategy.models.answer import Answer
from fund_public_goods.lib.strategy.utils.utils import get_project_text
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


evaluation_prompt_template = """

As a professional evaluator of public goods projects, your task involves analyzing project information to prepare a concise report on:

- Relevance: Assess how closely a project aligns with the user's prompt,
critically examining the project description for genuine relevance versus promotional language.
Identify key points of alignment, discrepancies, and provide a rationale for the degree of match.

- Impact: Evaluate the project's impact based on concrete evidence of past achievements.
Summarize verifiable accomplishments, assess the significance of these outcomes, and critically analyze the project's tangible impact.
If no concrete proof is available, note this.

- Funding Needs: Concisely assess the project's funding requirements by summarizing its budget, funding sources, and major expenses.
Identify genuine funding needs linked to project goals and assess fund usage effectiveness.
Provide a rationale for the exact funding needed to maximize impact efficiently.

Your objective is to critically sift through self-reported data to determine project alignment with user interests, verify past impact, and accurately assess funding needs, focusing on factual evidence and realistic project outcomes.

User's prompt: {prompt}

Project: {project}

Your output should be in markdown format with the following structure:

## Relevance
...

## Impact
...

## Funding needed
..
"""

def evaluate_projects(prompt: str, projects: list[tuple[Projects, list[Answer]]]) -> list[str]:
    evaluation_prompt = ChatPromptTemplate.from_messages([
        ("system", evaluation_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-3.5-turbo-0125") # type: ignore

    evaluation_chain = evaluation_prompt | llm | StrOutputParser()
    
    evaluation_reports = evaluation_chain.batch([{
        "prompt": prompt,
        "project": get_project_text(project)
    } for project in projects])
        
    return evaluation_reports
