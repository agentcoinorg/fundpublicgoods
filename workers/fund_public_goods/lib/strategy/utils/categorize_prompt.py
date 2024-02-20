from fund_public_goods.lib.strategy.utils.constants import PROJECT_CATEGORIES
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


categorize_prompt_template = """
Your goal is to categorize a user's prompt. These are the existing categories:

{categories}

Respond strictly with a comma-separated list of categories, without quotes. Do not change the wording
or casing of the categories, return them exactly as they are written in the list above.

A user's prompt can match to more than one category. Be strict with assigning categories.
Return a max of {n} categories, you can reutrn less if the project really only matches less than {n} categories.

Some prompts will not be able to be categorized. If that's the case, simply respond with "NONE" (without quotes).

Prompt: {prompt}
"""


def categorize_prompt(prompt: str, categories: list[str]) -> list[str]:
    categorize_prompt = ChatPromptTemplate.from_messages([
        ("system", categorize_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    categorize_chain = categorize_prompt | llm | StrOutputParser()

    categories_res = categorize_chain.invoke({
        "prompt": prompt,
        "categories": "\n".join(f"- {category}" for category in categories),
        "n": 3
    })
    category_strings = [c.strip() for c in categories_res.split(',')]
    result: list[str] = []

    for category_string in category_strings:
        if category_string == "NONE":
            result.append(categories[0])
            result.append(categories[1])
            result.append(categories[2])
        else:
            result.append(category_string)

    if len(result) == 0:
        raise Exception(
            f"The LLM has responded with no categories. Llm response ({categories_res}). Response split ({category_strings})"
        )

    return result
