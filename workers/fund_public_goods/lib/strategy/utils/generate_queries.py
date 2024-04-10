from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import CommaSeparatedListOutputParser


queries_prompt_template = """
Your goal is to provide a list of queries that will be used to perform
and embeddings search over different project descriptions and get the ones
that best match the user's interests. All projects are public goods funding
projects in the crypto ecosystem.

Provide a maximum of {n} queries.

This is the user's interest: {prompt}

Respond strictly with a comma-separated list of queries, without quotes
"""


def generate_queries(prompt: str, n) -> list[str]:
    queries_prompt = ChatPromptTemplate.from_messages([
        ("system", queries_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-4-turbo") # type: ignore

    queries_chain = queries_prompt | llm | CommaSeparatedListOutputParser()

    queries = queries_chain.invoke({
        "prompt": prompt,
        "n": n,
    })
    
    return queries
