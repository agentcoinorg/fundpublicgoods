from fund_public_goods.lib.strategy.utils.constants import PROJECT_CATEGORIES
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


categorize_prompt_template = """
Your goal is to categorize a user's prompt. These are the existing categories:

{categories}

Respond strictly with a comma-separated list of categories, without quotes. Do not change the wording
or casing of the categories, return them exactly as they are written in the list above.

You must make sure that the categorization of the prompt is extensive enough so projects can be retrieved
based on these categories.

Prompt: {prompt}
"""


def categorize_prompt(prompt: str, categories: list[str]) -> list[str]:
    categorize_prompt = ChatPromptTemplate.from_messages([
        ("system", categorize_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    categorize_chain = categorize_prompt | llm | StrOutputParser()

    categories = [c.strip() for c in categorize_chain.invoke({
        "prompt": prompt,
        "categories": "\n".join(f"- {category}" for category in categories)
    }).split(',')]
            
    return categories