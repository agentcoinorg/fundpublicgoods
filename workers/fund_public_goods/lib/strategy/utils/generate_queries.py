from fund_public_goods.db.entities import Projects
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import CommaSeparatedListOutputParser


queries_prompt_template = """
Your goal is to provide a list of {n} broad and insightful label based on a user's prompt.
Avoid too general and too basic labels like 'blockchain', 'opportunity', etc. Don't include
additional concepts, just try to reword the user's prompt in the form of labels

The idea is to search projects using these generated labels.

Respond strictly with a comma-separated list of labels, without quotes. If no labels, simply respond with "NONE" (without quotes)

Prompt: {prompt}
"""


def generate_queries(prompt: str, n: int) -> list[str]:
    queries_prompt = ChatPromptTemplate.from_messages([
        ("system", queries_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    queries_chain = queries_prompt | llm | CommaSeparatedListOutputParser()

    queries = queries_chain.invoke({
        "prompt": prompt,
        "n": n
    })
            
    return queries