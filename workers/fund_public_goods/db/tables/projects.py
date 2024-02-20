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
        "keywords": row.keywords,
        "categories": row.categories,
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
        "keywords": row.keywords,
        "categories": row.categories,
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
            keywords=project_data.get("keywords", []),
            categories=project_data.get("categories", []),
            short_description=project_data.get("short_description", None),
            funding_needed=project_data.get("funding_needed", None),
            impact=project_data.get("impact", None),
            impact_funding_report=project_data.get("impact_funding_report", None),
        )
        
        projects_with_answers.append((project, answers))

    return projects_with_answers


def get_unique_categories() -> list[str]:
    db = create_admin()
    response: PostgrestAPIResponse[list[dict[str, str]]] = (
        db.table("unique_categories_views").select("*").execute()
    )
    if not response.data:
        return []

    categories = []

    for row in response.data:
        categories.append(row["category"]) # type: ignore

    return categories

def get_projects(range_from: int, range_to: int) -> PostgrestAPIResponse[dict[str, Any]]:
    db = create_admin()
    return (
        db.table("projects")
        .select(
            "*, applications(id, recipient, round, answers)"
        )
        .range(range_from, range_to)
        .execute()
    )

def get_all_projects():
    all_results: list[dict[str, Any]] = []
    current_from = 0
    page_size = 999
    while True:
        current_to = current_from + page_size
        results = get_projects(current_from, current_to).data
        all_results.extend(results)
        
        if len(results) < page_size:
            break

        current_from += page_size
    
    return sanitize_projects_information(all_results)

def fetch_projects_by_category(categories: list[str]) -> list[tuple[Projects, list[Answer]]]:
    results = get_projects_from_description(categories).data
    sanitized_projects = sanitize_projects_information(results) 
    return sanitized_projects

def get_projects_from_description(categories: list[str]):
    db = create_admin()
    request = (
        db.table("projects")
        .select(
            "* applications(id, recipient, round, answers)"
        )
        .ov("categories", categories)
        .execute()
    )

    return request
