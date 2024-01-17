from fastapi import APIRouter

router = APIRouter()


class CreatePlanParams:
    topic: str

@router.post("/api/create-plan")
async def create_plan(params: CreatePlanParams):
    return {
        "plan": f"""
Got it. Here is my plan:
1. Search through Gitcoin project registry to find projects that are working on {params.topic}
2. Evaluate the impact these projects have had on {params.topic}
3. Determine the relative funding needs of the most impactful {params.topic} projects
4. Synthesize findings to suggest how many tokens to send to each project
5. Connect to your wallet and analyze your budget
6. Generate transactions for you to review
"""
    }
