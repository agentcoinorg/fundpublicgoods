from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from fund_public_goods.db.entities import Projects
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.utils.get_project_answers import get_project_answers
from fund_public_goods.lib.strategy.utils.utils import get_project_text


evaluation_prompt_template = """
You are a professional public goods projects evaluator.

You will receive a project's information abstract and you will prepare a thorough report
assessing:

- How well each project matches the user's prompt.
- Project's impact.
- How much funding does the project need

You will provide clear and thorough reasoning for each criteria.

Structure your output in markdown format

User's prompt: {prompt}

Project: {project}
"""

def evaluate_project(prompt: str, project: Projects):
    answers = get_project_answers(project.id)
    evaluation_prompt = ChatPromptTemplate.from_messages([
        ("system", evaluation_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-3.5-turbo-0125") # type: ignore

    evaluation_chain = evaluation_prompt | llm | StrOutputParser()

    evaluation_report = evaluation_chain.invoke({
        "prompt": prompt,
        "project": get_project_text(Project(
            id=project.id,
            title=project.title,
            description=project.description,
            website=project.website,
            twitter=project.twitter,
            logo=project.logo,
            answers=answers
        ))
    })
    
    return evaluation_report
