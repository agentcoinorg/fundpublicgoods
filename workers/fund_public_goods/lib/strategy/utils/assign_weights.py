from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.output_parsers.json import JsonOutputParser
import json
from fund_public_goods.lib.strategy.models.evaluated_project import EvaluatedProject
from fund_public_goods.lib.strategy.models.weighted_project import WeightedProject

assign_weights_prompt_template = """
You are a specialist in public goods funding. You will receive a list of projects
that are relevant to the user's interests and/or have made a significant impact.
Each of them have an impact score, an interest score and a reasoning for these scores.
The user wants to donate to these projects.

Be sure to include the ID of each project in your answer.

Your job is to assign a donation weight percentage (number from 0 to 1 with 2 decimal places) to each of the projects so that the
user can distribute the funds he wants to donate accordingly across projects. The sum of all weights must be equal to 1.

Provide thorough reasoning for each assigned weight.

Projects:

{projects}
"""

def assign_weights(evaluated_projects: list[EvaluatedProject]) -> list[WeightedProject]:
    assign_weights_prompt = ChatPromptTemplate.from_messages([
        ("system", assign_weights_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore
    
    assign_weights_chain = assign_weights_prompt | llm | StrOutputParser()
    weights_report = assign_weights_chain.invoke({
        "projects": json.dumps([x.model_dump() for x in evaluated_projects])
    })
    
    return extract_weights(weights_report, evaluated_projects)
    
extract_weights_prompt_template = """
You will receive a report with a list of projects and assigned weights.
You will extract each project's ID and weight and return
a single JSON array of JSON objects to be parsed by Python's "json.loads()":

[{{
    project_id: str,
    weight: float,
}}, ... ]

Do not include any other contents in your response.

Report:

{report}
"""
    
def extract_weights(weights_report: str, evaluated_projects: list[EvaluatedProject]) -> list[WeightedProject]:
    evaluated_projects_by_id = {project.project.id: project for project in evaluated_projects}
    
    extract_weights_prompt = ChatPromptTemplate.from_messages([
        ("system", extract_weights_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore
    
    extract_weights_chain = extract_weights_prompt | llm | JsonOutputParser()
    json_weights = extract_weights_chain.invoke({
        "report": weights_report
    })
    
    weighted_projects: list[WeightedProject] = []
    
    for json_weight in json_weights:
        evaluated_project = evaluated_projects_by_id[json_weight["project_id"]]
        weighted_project = WeightedProject(
            project=evaluated_project.project,
            scores=evaluated_project.evaluation,
            weight=json_weight["weight"]
        )
        weighted_projects.append(weighted_project)
    
    return weighted_projects