from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers.json import JsonOutputParser
from fund_public_goods.lib.strategy.models.project import Project
from fund_public_goods.lib.strategy.models.project_scores import ProjectScores


score_projects_prompt_template = """
You will be given a list of project reports that assess:

- How well each project matches the user's prompt.
- Project's impact.
- How much funding does the project need

For each project in the list, you will state:

- A Prompt match score (must be a number from 0 to 1, with 2 decimal places)
- An Impact score (must be a number from 0 to 1, with 2 decimal places)
- A Funding needed score (must be a number from 0 to 1, with 2 decimal places)
- Reasoning for the given scores

You will return a single JSON array of JSON objects to be parsed by Python's "json.loads()":

[{{
    project_id: str,
    reasoning: str,
    prompt_match: float,
    impact: float,
    funding_needed: float
}}, ... ]

Do not include any other contents in your response. Always use snake case. All fields are required

Project reports:

{evaluation_report}
"""

def score_projects(projects_with_report: list[tuple[Project, str]]) -> list[ProjectScores]:
    reports = [f"Project ID: {project.id}\n\n{report}" for (project, report) in projects_with_report]
    
    score_projects_prompt = ChatPromptTemplate.from_messages([
        ("system", score_projects_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore
    
    scoring_chain = score_projects_prompt | llm | JsonOutputParser()
    
    raw_scored_projects = scoring_chain.invoke({
        "reports": reports
    })
    
    scored_projects: list[ProjectScores] = []
    for raw_scored_project in raw_scored_projects:
        scored_project = ProjectScores(**raw_scored_project)
        scored_projects.append(scored_project)
    
    return scored_projects