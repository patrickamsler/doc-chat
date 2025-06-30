from dotenv import load_dotenv, find_dotenv
from langchain.chains import LLMChain
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, \
    HumanMessagePromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from pydantic import Field, conint

_ = load_dotenv(find_dotenv())


class EvaluationFeedback(BaseModel):
    feedback: str = Field(
        ...,
        description="A detailed feedback that strictly assesses the response quality based on the score rubric."
    )
    score: conint(ge=1, le=5) = Field(
        ...,
        description="An integer score between 1 and 5, strictly following the score rubric."
    )


user_prompt_template = """
###Task Description:
An instruction (might include an Input inside it), a response to evaluate, a reference answer that gets a score of 5, and a score rubric representing a evaluation criteria are given.
1. Write a detailed feedback that assess the quality of the response strictly based on the given score rubric, not evaluating in general.
2. After writing a feedback, write a score that is an integer between 1 and 5. You should refer to the score rubric.

###The instruction to evaluate:
{instruction}

###Response to evaluate:
{generated_answer}

###Reference Answer (Score 5):
{reference_answer}

###Score Rubrics:
[Is the response correct, accurate, and factual based on the reference answer?]
Score 1: The response is completely incorrect, inaccurate, and/or not factual.
Score 2: The response is mostly incorrect, inaccurate, and/or not factual.
Score 3: The response is somewhat correct, accurate, and/or factual.
Score 4: The response is mostly correct, accurate, and factual.
Score 5: The response is completely correct, accurate, and factual.

###Feedback:
"""


def evaluate_response(instruction: str, reference_answer: str,
      generated_answer: str) -> EvaluationFeedback:

    llm = ChatOpenAI(
        model="gpt-4o-2024-08-06",
        temperature=0.0,
        top_p=1.0,
        max_tokens=2048
    ).with_structured_output(EvaluationFeedback, method="json_schema")

    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(
            "You are a fair evaluator language model."
        ),
        HumanMessagePromptTemplate.from_template(user_prompt_template)
    ])

    evaluation_chain = prompt | llm

    result: EvaluationFeedback = evaluation_chain.invoke({
        "instruction": instruction,
        "generated_answer": generated_answer,
        "reference_answer": reference_answer
    })
    return result


if __name__ == "__main__":
    _ = load_dotenv(find_dotenv())
    eval_result = evaluate_response(
        instruction="What do keybullet kin drop?",
        reference_answer="Keybullet kin drop a key upon death.",
        generated_answer="Keybullet Kin drop a key upon death."
    )
    print("Feedback:", eval_result.feedback)
    print("Score:", eval_result.score)
