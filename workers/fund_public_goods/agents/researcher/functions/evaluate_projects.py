from fund_public_goods.agents.researcher.utils.projects import stringify_projects
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.output_parsers.json import JsonOutputParser
from fund_public_goods.agents.researcher.models.evaluated_project import EvaluatedProject
from fund_public_goods.agents.researcher.models.project import Project
from fund_public_goods.agents.researcher.models.project_evaluation import ProjectEvaluation


extract_evaluations_prompts_template = """
You will be given a list of project evaluations that measure how well each project
matches the user's interest, and its impact in regards to that interest.

You will return a list of the top projects the user should donate to. For a project to be
in the list, it must have:

- Impact score equal or greater than {impact_threshold}
- Interest score equal or greater than {interest_threshold}

You will return a single JSON array of JSON objects to be parsed by Python's "json.loads()":

[{{
    project_id: str,
    reasoning: str,
    interest: float,
    impact: float,
}}, ... ]

Do not include any other contents in your response. If no projects meet the aforementioned criteria
simply respond with an empty array: []. Always use snake case. All fields are required

Evaluations:

{evaluation_report}
"""

def extract_project_evaluations(evaluation_report: str) -> list[ProjectEvaluation]:
    extract_evaluations_prompt = ChatPromptTemplate.from_messages([
        ("system", extract_evaluations_prompts_template),
    ])
    
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore
    
    evaluations_extraction_chain = extract_evaluations_prompt | llm | JsonOutputParser()
    
    raw_evaluations = evaluations_extraction_chain.invoke({
        "impact_threshold": "0.2",
        "interest_threshold": "0.4",
        "evaluation_report": evaluation_report
    })
    
    evaluations: list[ProjectEvaluation] = []
    for raw_evaluation in raw_evaluations:
        evaluation = ProjectEvaluation(**raw_evaluation)
        evaluations.append(evaluation)
    
    return evaluations


evaluation_prompt_template = """
You are a professional public goods projects evaluator.

You will receive a list of project information abstracts divided by '{separator}'
and you will assess:

- How well each project matches the user's interest. Provide a number from 0 to 1 with 2 decimal places.
- Project's impact. Provide a number from 0 to 1 with 2 decimal places.

You will provide clear and thorough reasoning for each. You will include the ID of each project.

User's interest: {prompt}

Projects: {projects}
"""

def evaluate_projects(prompt: str, projects: list[Project]) -> list[EvaluatedProject]:
    projects_by_id = {project.id: project for project in projects}
    
    evaluation_prompt = ChatPromptTemplate.from_messages([
        ("system", evaluation_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    evaluation_chain = evaluation_prompt | llm | StrOutputParser()
    
    separator = "\n-----\n"

    evaluation_report = evaluation_chain.invoke({
        "prompt": prompt,
        "separator": separator,
        "projects": stringify_projects(projects=projects, separator=separator)
    })
    
    evaluations = extract_project_evaluations(evaluation_report=evaluation_report)
    
    evaluated_projects: list[EvaluatedProject] = []
    
    for evaluation in evaluations:
        evaluated_project = EvaluatedProject(
            project=projects_by_id[evaluation.project_id],
            evaluation=evaluation
        )
        
        evaluated_projects.append(evaluated_project)
    
    return evaluated_projects