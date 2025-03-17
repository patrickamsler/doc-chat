from langchain_openai import OpenAI
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

# Initialize your LLM (ensure you have set up your OpenAI API key if using OpenAI)
llm = OpenAI(temperature=0.7)

# Run a simple prompt
response = llm.invoke("Hello, LangChain!")
print(response)