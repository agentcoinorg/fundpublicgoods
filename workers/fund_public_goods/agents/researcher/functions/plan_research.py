from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

AVAILABLE_DATASOURCES = ["Gitcoin"]

plan_prompt_template = """
You are a professional researcher specialized in public goods funding.

Your goal is to provide a plan so that users can donate to one or multiple projects
that have an impact in a cause or topic of their interest.

Consider that all projects come from
the current datasources only: {datasources}; and the only steps that the plan should contain are:

1. Get information from the datasources
2. Assess the impact of each project related to the user's interest
3. Determine the relative funding that the best matching projects need
4. Provide recommendation on how much to donate to each project that matches the user's interests
5. Generate one or multiple blockchain transactions to perform the donations based on the
recommendations

Do not include any other features or steps that are not necessary. Be concrete and rephrase the steps
to adapt to the user's specific interest. Only reply with the plan.

This is the user's interest: {prompt}
"""


def plan_research(prompt: str) -> str:
    plan_prompt = ChatPromptTemplate.from_messages([
        ("system", plan_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    plan_chain = plan_prompt | llm | StrOutputParser()

    plan = plan_chain.invoke({
        "prompt": prompt,
        "datasources": AVAILABLE_DATASOURCES
    })
    
    return plan
