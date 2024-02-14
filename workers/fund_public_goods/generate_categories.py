from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

load_dotenv()

categories_prompt_template = """
Your goal is to provide a list of project categories based on the following group of project tags.
Don't limit yourself to 10 if there should be more; but don't provide more than 100.
Be specific and consider all tags. Consider that all projects are in the blockchain ecosystem and seeking public goods funding.

Respond with only the category list

List of project tags:

{tags}
"""


def generate_categories(tags: list[str]) -> str:
    categories_prompt = ChatPromptTemplate.from_messages([
        ("system", categories_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    categories_chain = categories_prompt | llm | StrOutputParser()

    response = categories_chain.invoke({
        "tags": tags
    })
    
    print(response)
            
    return response