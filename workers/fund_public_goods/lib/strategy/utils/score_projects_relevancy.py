from fund_public_goods.db.entities import Projects
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers.json import JsonOutputParser
from fund_public_goods.lib.strategy.models.project_scores import ProjectRelevancyScores, ProjectScores


score_projects_relevancy_prompt_template = """
As an agent tasked with numerically scoring public goods projects, you will use the evaluator's reports to a project on
its alignment with user's prompt.

Score the project's alignment with the user's prompt on a scale of 0 to 1 using 2 decimals,
where 0 indicates no alignment and 1 represents perfect alignment.

Consider the project's relevance to the user's interests, the genuine use of specific terms over buzzwords,
and the depth of commitment to the prompt's themes.

Provide a brief justification for your score, referencing specific aspects of the evaluator's report that influenced your decision.
Your goal is to offer a quantitative assessment that reflects a comprehensive and critical analysis of the project's alignment with user prompts.

You will return a single JSON object:

{{
    project_id: str,
    prompt_match: float,
}}

Do not include any other contents in your response. Always use snake case. All fields are required

User prompt: {prompt}

Project report:

{report}
"""

def score_projects_relevancy(projects_with_report: list[tuple[Projects, str]], prompt: str) -> list[ProjectRelevancyScores]:
    reports = [f"Project ID: {project.id}\n\n{report}" for (project, report) in projects_with_report]
    
    score_projects_relevancy_prompt = ChatPromptTemplate.from_messages([
        ("system", score_projects_relevancy_prompt_template),
    ])
    
    llm = ChatOpenAI(model="gpt-4-turbo", temperature=0, model_kwargs={'seed': 10}) # type: ignore
    
    scoring_chain = score_projects_relevancy_prompt | llm | JsonOutputParser()
    
    raw_scored_projects = scoring_chain.batch([{
        "report": report,
        "prompt": prompt
    } for report in reports ])
    
    scored_projects: list[ProjectRelevancyScores] = []
    for raw_scored_project in raw_scored_projects:
        scored_project = ProjectRelevancyScores(**raw_scored_project)
        scored_projects.append(scored_project)
    
    return scored_projects