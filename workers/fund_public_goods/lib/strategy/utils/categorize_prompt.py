from fund_public_goods.lib.strategy.utils.constants import PROJECT_CATEGORIES
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


categorize_prompt_template = """
Your goal is to categorize a user's prompt. These are the existing categories:

{categories}

A user's prompt can match to more than one category. Be strict with assigning categories.
Return a max of {n} categories, you can reutrn less if the project really only matches less than {n} categories.

Respond strictly with a comma-separated list of categories, without quotes. Do not change the wording
or casing of the categories, return them exactly as they are written in the list above.

Prompt: {prompt}
"""


def categorize_prompt(prompt: str, n: int) -> list[str]:
    categorize_prompt = ChatPromptTemplate.from_messages([
        ("system", categorize_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    categorize_chain = categorize_prompt | llm | StrOutputParser()

    categories = [c.strip() for c in categorize_chain.invoke({
        "prompt": prompt,
        'n': n,
        "categories": "\n".join(f"- {category}" for category in PROJECT_CATEGORIES)
    }).split(',')]
            
    return categories