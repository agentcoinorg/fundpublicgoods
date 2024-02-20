from typing import Any
from fund_public_goods.lib.strategy.models.answer import Answer
from supabase import PostgrestAPIResponse
from fund_public_goods.db.entities import Projects
from fund_public_goods.db.app_db import create_admin


def upsert(
    row: Projects
):
    db = create_admin()
    db.table("projects").upsert({
        "id": row.id,
        "updated_at": row.updated_at,
        "title": row.title,
        "description": row.description,
        "website": row.website,
        "twitter": row.twitter,
        "short_description": row.short_description,
        "logo": row.logo,
        "funding_needed": row.funding_needed,
        "impact_funding_report": row.impact_funding_report,
        "impact": row.impact
    }).execute()
    
def upsert_multiple(
    rows: list[Projects]
):
    db = create_admin()
    db.table("projects").upsert([{
        "id": row.id,
        "updated_at": row.updated_at,
        "title": row.title,
        "description": row.description,
        "website": row.website,
        "twitter": row.twitter,
        "short_description": row.short_description,
        "logo": row.logo,
        "funding_needed": row.funding_needed,
        "impact_funding_report": row.impact_funding_report,
        "impact": row.impact
    } for row in rows]).execute()


def sanitize_projects_information(projects: list[dict[str, Any]]) -> list[tuple[Projects, list[Answer]]]:
    projects_with_answers: list[tuple[Projects, list[Answer]]] = []
    for item in projects:
        answers: list[Answer] = []

        for application in item.get("applications", []):
            for answer in application.get("answers", []):
                answers.append(Answer(
                    question=answer.get("question", ""),
                    answer=answer.get("answer", None)
                ))
        
        # Remove all None values
        project_data = {k: v for k, v in item.items() if v is not None}

        project = Projects(
            id=project_data.get("id", ""),
            updated_at=project_data.get("updated_at", ""),
            title=project_data.get("title", ""),
            description=project_data.get("description", ""),
            website=project_data.get("website", ""),
            twitter=project_data.get("twitter", ""),
            logo=project_data.get("logo", ""),
            short_description=project_data.get("short_description", None),
            funding_needed=project_data.get("funding_needed", None),
            impact=project_data.get("impact", None),
            impact_funding_report=project_data.get("impact_funding_report", None),
        )
        
        projects_with_answers.append((project, answers))

    return projects_with_answers


def get_projects_lightweight(range_from: int, range_to: int) -> PostgrestAPIResponse[dict[str, Any]]:
    db = create_admin()
    return (
        db.table("projects")
        .select(
            "id, title, website, updated_at, description"
        )
        .range(range_from, range_to)
        .execute()
    )
    
def get_projects_by_ids(ids: list[str]) -> list[tuple[Projects, list[Answer]]]:
    db = create_admin()
    results = (
        db.table("projects")
        .select(
            "*, applications(id, recipient, round, answers)"
        )
        .in_('id', ids)
        .execute()
    )
    
    return sanitize_projects_information(results.data)


def get_all_projects_lightweight() -> list[Projects]:
    all_results: list[dict[str, Any]] = []
    current_from = 0
    page_size = 999
    while True:
        current_to = current_from + page_size
        results = get_projects_lightweight(current_from, current_to).data
        all_results.extend(results)
        
        if len(results) < page_size:
            break

        current_from += page_size
        
    projects: list[Projects] = []
        
    for item in all_results:
        # Remove all None values
        project_data = {k: v for k, v in item.items() if v is not None}

        project = Projects(
            id=project_data.get("id", ""),
            updated_at=project_data.get("updated_at", ""),
            title=project_data.get("title", ""),
            description=project_data.get("description", ""),
            website=project_data.get("website", ""),
            twitter=project_data.get("twitter", ""),
            logo=project_data.get("logo", ""),
            short_description=project_data.get("short_description", None),
            funding_needed=project_data.get("funding_needed", None),
            impact=project_data.get("impact", None),
            impact_funding_report=project_data.get("impact_funding_report", None),
        )
        
        projects.append(project)

    return projects

