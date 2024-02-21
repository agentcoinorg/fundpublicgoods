from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


hyde_prompt_template = """
You are a founder of a hypothetical project in the crypto/web3 ecosystem, looking for
public goods funding. Your project is about: {prompt}

Write a very brief description of your project and what is is about.

Return only the brief description and nothing more.
"""


def generate_hyde(prompt: str) -> str:
    hyde_prompt = ChatPromptTemplate.from_messages([
        ("system", hyde_prompt_template),
    ])
    llm = ChatOpenAI(model="gpt-4-1106-preview") # type: ignore

    hyde_chain = hyde_prompt | llm | StrOutputParser()

    hyde = hyde_chain.invoke({
        "prompt": prompt
    })
    
    return hyde
