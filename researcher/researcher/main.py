from researcher.functions.evaluate_projects import evaluate_projects
from researcher.functions.plan_research import plan_research
import os
import json
from dotenv import load_dotenv
from researcher.models.answer import Answer
from researcher.models.project import Project

load_dotenv()

def fetch_projects(directory: str) -> list[Project]:
    print(os.listdir("."))
    all_data: list[Project] = []

    for filename in os.listdir(directory):
        if filename.endswith('.json') and not filename.startswith('project'):
            file_path = os.path.join(directory, filename)

            with open(file_path, 'r') as file:
                try:
                    data = json.load(file)
                    answers: list[Answer] = []
                    
                    for application in data.get("applications", []):
                        for raw_answer in application["data"]["application"]["answers"]:
                            answer = Answer(
                                question=raw_answer["question"],
                                answer=str(raw_answer.get("answer", None))
                            )
                            answers.append(answer)
                    
                    project = Project(
                        id=data["id"],
                        title=data["data"]["title"],
                        recipient=data["applications"][0]["data"]["application"]["recipient"],
                        description=data["data"]["description"],
                        website=data["data"]["website"],
                        answers=answers
                    )
                    
                    all_data.append(project)
                except json.JSONDecodeError as e:
                    print(f"Error reading {filename}: {e}")

    return all_data
    

def main():
    projects = fetch_projects(directory="./project_data")
    result = evaluate_projects(prompt="AI applied to crypto markets", projects=projects)
    
    print(result)

if __name__ == '__main__':
    main()
