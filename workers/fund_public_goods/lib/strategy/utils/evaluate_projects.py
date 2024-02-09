from fund_public_goods.db.entities import Projects
from fund_public_goods.lib.strategy.utils.get_project_answers import get_project_answers
from fund_public_goods.lib.strategy.utils.utils import get_project_text
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from fund_public_goods.lib.strategy.models.project import Project


evaluation_prompt_template = """
You are a professional public goods projects evaluator.

You will receive a project's information abstract and you will prepare a thorough report
assessing:

- How well each project matches the user's prompt.

- Project's impact: Using the project's self-reported description and the answers provided in questionnaires for donation requests,
evaluate the past impact of the project. Start by extracting key information from the self-reported description
to understand the project's goals, target demographic, strategies employed, and any outcomes or achievements mentioned

- How much funding does the project need: identify current financial gaps, justify the necessity for additional funding,
and predict the potential impact of increased financial resources on the project's goals and outcomes. Consider past donations
and money raises

You will provide clear and thorough reasoning for each criteria.

Structure your output in markdown format

User's prompt: {prompt}

Project: {project}
"""

def evaluate_projects(prompt: str, projects: list[Projects]) -> list[str]:
    project_texts: list[str] = []
    
    for project in projects:
        
        answers = get_project_answers(project.id)
        project_text = get_project_text(Project(
                id=project.id,
                title=project.title,
                description=project.description,
                website=project.website,
                twitter=project.twitter,
                logo=project.logo,
                answers=answers
            )
        )
        
        project_texts.append(project_text)
    
    
    evaluation_prompt = ChatPromptTemplate.from_messages([
        ("system", evaluation_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-3.5-turbo-0125") # type: ignore

    evaluation_chain = evaluation_prompt | llm | StrOutputParser()
    
    evaluation_reports = evaluation_chain.batch([{
        "prompt": prompt,
        "project": project_text
    } for project_text in project_texts])
        
    return evaluation_reports
