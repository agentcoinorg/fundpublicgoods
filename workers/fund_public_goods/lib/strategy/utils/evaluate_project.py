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
- Project's impact.
- How much funding does the project need

You will provide clear and thorough reasoning for each criteria.

Structure your output in markdown format

User's prompt: {prompt}

Project: {project}
"""

def evaluate_project(prompt: str, project: Project):
    evaluation_prompt = ChatPromptTemplate.from_messages([
        ("system", evaluation_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-3.5-turbo-0125") # type: ignore

    evaluation_chain = evaluation_prompt | llm | StrOutputParser()
    
    evaluation_report = evaluation_chain.invoke({
        "prompt": prompt,
        "project": get_project_text(project)
    })
        
    return evaluation_report
