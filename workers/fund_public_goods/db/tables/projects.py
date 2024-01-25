from typing import Any, Dict
from fund_public_goods.lib.strategy.models.answer import Answer
from fund_public_goods.lib.strategy.models.project import Project
from supabase import Client, PostgrestAPIResponse
import uuid


def insert(
    db: Client, title: str, recipient: str, description: str, website: str
) -> str:
    id = str(uuid.uuid4())
    db.table("projects").insert(
        {
            "id": id,
            "title": title,
            "recipient": recipient,
            "description": description,
            "website": website,
        }
    ).execute()
    return id


def get_projects(db: Client) -> PostgrestAPIResponse[Dict[str, Any]]:
    return (
        db.table("projects")
        .select(
            "id, title, description, website, applications(id, recipient, round, answers)"
        )
        .execute()
    )

def fetch_projects_data(supabase: Client) -> list[Project]:
    response = get_projects(supabase)
    
    projects: list[Project] = []

    for item in response.data:
        answers: list[Answer] = []

        for application in item.get("applications", []):
            for answer in application.get("answers", []):
                answers.append(Answer(
                    question=answer.get("question", ""),
                    answer=answer.get("answer", None)
                ))
        
        project = Project(
            id=item.get("id", ""),
            title=item.get("title", ""),
            description=item.get("description", ""),
            website=item.get("website", ""),
            answers=answers,
        )
        
        projects.append(project)

    return projects