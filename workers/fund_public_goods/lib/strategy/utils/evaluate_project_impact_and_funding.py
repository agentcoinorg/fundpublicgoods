from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from fund_public_goods.lib.strategy.models.project import Project


evaluation_prompt_template = """
You are a professional public goods projects evaluator.

You will receive a project's information abstract and you will prepare a thorough report
assessing:

- Project's impact.
- How much funding does the project need

You will provide clear and thorough reasoning for each criteria.

Structure your output in markdown format that follows the following structure:

`## Project's Impact

...

## Funding Needs

...
`

You can include sub sections within that structure but not add higher level sections

User's prompt: {prompt}

Project: {project}
"""

def evaluate_project_impact_and_funding(prompt: str, project: Project):
    evaluation_prompt = ChatPromptTemplate.from_messages([
        ("system", evaluation_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-3.5-turbo-0125") # type: ignore

    evaluation_chain = evaluation_prompt | llm | StrOutputParser()
    
    project_text = f"ID: {project.id} - Description: {project.description}. \n"
    answer_groups = [application.model_dump().get('answers', []) for application in project.applications]

    for answer_group in answer_groups:
        for answer in answer_group:
            project_text += f"  Question: {answer.get('question', '')}\n"
            project_text += f"  Answer: {answer.get('answer', '')}\n"
    
    evaluation_report = evaluation_chain.invoke({
        "prompt": prompt,
        "project": project_text
    })
        
    return evaluation_report
