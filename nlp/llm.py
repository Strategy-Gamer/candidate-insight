from transformers import AutoTokenizer, AutoModelForCausalLM
from ollama import chat
from ollama import ChatResponse
import pandas as pd
import re
import torch
import os
import json

from ollama import chat
from ollama import ChatResponse

issue_list = """
- Ukraine War
- Israel-Gaza War
- China
- Military Spending
- Abortion
- Transgender Rights
- Election Integrity
- Diversity, Equity, Inclusion
- Border Patrol
- Border Wall
- Decreasing Immigration
- Illegal/Undocumented Migrants
- Progressive Taxation
- Regulations
- Tariffs
- Balancing the Budget
- Public Healthcare
- Private Healthcare
- Medicare Expansion
- Limits on Prescription Drug Prices
- Student Loan Forgiveness
- Public School Funding
- School Choice
- Affirmative Action
- Renewable Energy
- Nuclear Energy
- Carbon Emissions Controls
- Pollutant Controls
- Background Checks
- Assault Weapons Ban
- Gun Ownership
- Ammunition Restrictions
"""

examples = """
Example 1:
Sentence: "We need to expand Medicare so that more seniors can receive affordable care."
Issue: Medicare Expansion
Stance: support
Confidence: 0.95

Example 2:
Sentence: "I will fight for the rights of the unborn in our state."
Issue: Abortion
Stance: oppose
Confidence: 0.94

Example 3:
Sentence: "She believes we must reduce gun regulations and protect the Second Amendment."
Issue: Gun Ownership
Stance: support
Confidence: 0.88

Example 4:
Sentence: "Proud to represent the people of Wisconsin!"
Issue: None
Stance: None
Confidence: 0.0

Example 5:
Sentence: "We are a nation of immigrants."
Issue: Decreasing Immigration
Stance: oppose
Confidence: 0.3
"""



def classify_policy_statement(statement):
    system_prompt = f"""
    {examples}


    Please identify the most relevant policy issue, the speaker's stance (support or oppose), and a confidence value from 0.0 to 1.0 in the following sentence:

    "{statement}"

    Only choose from this list of issues:
    {issue_list}

    Your response should be in this format. Do not deviate from it:
    Issue: <issue>
    Stance: <support or oppose>
    Confidence: <float>

    If no policy issue from the list is relevant to the sentence, reply:

    Issue: None
    Stance: None
    Confidence: 0.0

    Begin your response below:
    Issue: 
    """

    response = chat(model='llama3.2', messages=[
        { 'role': 'user', 'content': system_prompt }
    ])

    return response.message.content.strip()

def check_policy_statement(statement):
    system_prompt = f"""
    Please identify if the following sentence is discussing policy:

    "{statement}"

    Here is a list of issues that may help with determining whether the sentence is discussing policy or not:
    {issue_list}

    If it is a policy relevant statement, reply "Yes", otherwise if it is irrelevant (so if it's about fundraising or legal disclaimers or something else) reply "No".

    State Yes/No below: 
    """

    response = chat(model='llama3.2', messages=[
        { 'role': 'user', 'content': system_prompt }
    ])

    return response.message.content.strip()


def parse_llm_response(response):
    issue = None
    stance = None

    # Try pattern-based first
    issue_match = re.search(r"Issue:\s*(.+)", response, re.IGNORECASE)
    stance_match = re.search(r"Stance:\s*(support|oppose)", response, re.IGNORECASE)
    conf_match = re.search(r"Confidence:\s*([0-9.]+)", response, re.IGNORECASE)

    if issue_match:
        issue = issue_match.group(1).strip(" .:\n")

    if stance_match:
        stance = stance_match.group(1).lower()

    if conf_match:
        confidence = float(conf_match.group(1).strip())

    # Fallback for "Issue\nStance\nConf" style
    if not issue or not stance:
        lines = response.strip().splitlines()
        if len(lines) >= 3:
            if not issue:
                issue = lines[0].strip()
            if not stance:
                stance = lines[1].strip().lower()
            if not stance:
                stance = lines[2].strip().lower()

    return issue, stance, confidence

raw = check_policy_statement("Tammy supports expanding Medicare.")
print(raw)

raw = check_policy_statement("Tammy loves her home state of Wisconsin.")
print(raw)
