import db_handling
import spacy
import numpy as np
import json
from datetime import datetime
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from spacy.matcher import PhraseMatcher
from transformers import AutoTokenizer, AutoModelForCausalLM
from ollama import chat
from ollama import ChatResponse
import pandas as pd
import re
import os

#####################
### --- Setup --- ###
#####################
issue_stance_phrases = {
    # Foreign Policy
    "Ukraine War": {"support": [], "oppose": []},
    "Israel-Gaza War": {"support": [], "oppose": []},
    "China": {"support": [], "oppose": []},
    "Military Spending": {"support": [], "oppose": []},

    # Social Issues
    "Abortion": {"support": [], "oppose": []},
    "Transgender Rights": {"support": [], "oppose": []},
    "Election Integrity": {"support": [], "oppose": []},
    "Diversity, Equity, Inclusion": {"support": [], "oppose": []},

    # Immigration
    "Border Patrol": {"support": [], "oppose": []},
    "Border Wall": {"support": [], "oppose": []},
    "Decreasing Immigration": {"support": [], "oppose": []},
    "Illegal/Undocumented Migrants": {"support": [], "oppose": []},

    # Economy
    "Progressive Taxation": {"support": [], "oppose": []},
    "Regulations": {"support": [], "oppose": []},
    "Tariffs": {"support": [], "oppose": []},
    "Balancing the Budget": {"support": [], "oppose": []},

    # Healthcare
    "Public Healthcare": {"support": [], "oppose": []},
    "Private Healthcare": {"support": [], "oppose": []},
    "Medicare Expansion": {"support": [], "oppose": []},
    "Limits on Prescription Drug Prices": {"support": [], "oppose": []},

    # Education
    "Student Loan Forgiveness": {"support": [], "oppose": []},
    "Public School Funding": {"support": [], "oppose": []},
    "School Choice": {"support": [], "oppose": []},
    "Affirmative Action": {"support": [], "oppose": []},

    # Environment
    "Renewable Energy": {"support": [], "oppose": []},
    "Nuclear Energy": {"support": [], "oppose": []},
    "Carbon Emissions Controls": {"support": [], "oppose": []},
    "Pollutant Controls": {"support": [], "oppose": []},

    # Civil Liberties
    "Background Checks": {"support": [], "oppose": []},
    "Assault Weapons Ban": {"support": [], "oppose": []},
    "Gun Ownership": {"support": [], "oppose": []},
    "Ammunition Restrictions": {"support": [], "oppose": []},
}

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

issue_trigger_phrases = {
    # Foreign Policy
    "Ukraine War": [
        "Ukraine", "Russian invasion", "Ukrainian", "Zelenskyy", "Putin", "cessation of hosilities", "Slava Ukraini"
    ],
    "Israel-Gaza War": [
        "Israel", "Gaza", "Palestine", "Hamas", "Israelis", "Palestinians", "Gazans", "Israeli", "Palestinian", 
        "Gazan", "from the river to the sea", "Zionist", "Zionism", "Jewish State", "ethno-state", "ethnostate", "Israel's right to exist", "IDF", "ceasefire" 
    ],
    "China": [
        "China", "Chinese government", "Chinese influence", "Chinese Communist Party", "trade with China", "CCP", "decoupling", "Xinjiang", "Uyghur", "Hong Kong", "Taiwan"
    ],
    "Military Spending": [
        "military spending", "defense budget", "the military", "defense funding", "cut military budget", "military-industrial complex", "endless wars", 
        "defense contractor",  "national defense", "deterrent", "DoD", "Department of Defense"
    ],

    # Social Issues
    "Abortion": [
        "abortion", "reproductive rights", "pro-choice", "pro-life", "right to choose", "unborn children", "terminate a pregnancy", 
        "termination", "elective abortion", "medical abortion", "late-term abortion", "partial-birth abortion", "abortion access", 
        "abortion services", "women's healthcare", "reproductive healthcare", "planned parenthood", "Plan B", "abortion pill", "bodily autonomy", 
        "my body, my choice", "safe and legal", "healthcare decision", "between a woman and her doctor", "trust women", "women's health", "family planning", 
        "unborn child", "preborn baby", "sanctity of life", "right to life", "pro-abortion", "heartbeat bill", "defend the unborn", "abortion is murder", 
        "Roe v. Wade", "roe v wade", "roe vs wade", "baby killing", "life begins at conception", "overturn roe", "Dobbs decision", "Dobbs v Jackson", "Dobbs vs Jackson", "Dobbs v. Jackson"
    ],
    "Transgender Rights": [
        "trans rights", "transgender athletes", "gender identity", "gender-affirming care", "bathroom bills", "transgender", "tranny", "transsexual", "transgender rights", "hrt", "sex change", 
        "gender affirming care", "gender-affirming care", "hormones", "surgeries", "nonbinary people", "trans women", "transwomen", "trans men", "trans men", 
        "gender expression", "transitioning", "hormone therapy", "misgendering", "bottom surgery", "top surgery", "mtf", "ftm", "deadnaming", "transphobia", "anti-trans legislation", "trans-inclusive", 
        "trans inclusive", "bathroom access", "protect trans youth", "protect trans kids", "transgender military ban", "gender marker", "lived experience", "chosen name", "inclusive healthcare", "pronouns", 
        "gender diversity", "biological male", "biological female", "trans ideology", "gender confusion", "genital mutilation"
    ],
    "Election Integrity": [
        "election fraud", "secure elections", "voter ID", "mail-in voting", "election transparency", "ballot integrity", "voter fraud", "absentee ballots", "provisional ballots", "voter suppression", 
        "free and fair elections", "Voting Rights Act", "same-day registration", "election interference", "FEC", "federal election commission",
    ],
    "Diversity, Equity, Inclusion": [
        "DEI", "diversity", "equity", "inclusion", "anti-racism", "woke", "wokeness", "intersectionality", "microaggressions", "racism", "discrimination", "reverse discrimination", 
        "tokenism", "quota", "affirmative action", "title ix", "inclusive", "identity politics"
    ],

    # Immigration
    "Border Patrol": [
        "border patrol", "ICE raids", "immigration checkpoints", "border crossings", "southern border", "catch and release", "border security", "cbp"
    ],
    "Border Wall": [
        "border wall", "border fence", "build the wall", "finish the wall", "wall at the border", "build the wall", "crisis at the border", "crisis at the southern border", "crisis at our southern border"
    ],
    "Decreasing Immigration": [
        "legal immigration", "green card limits", "visa lottery", "immigration quotas", "chain migration", "anchor babies", "melting pot", "migrant", "immigrant", 
        "green card", "naturalized citizen", "deportation", "detention center", "holding cells", "holding center", "visa", "citizenship", "open borders", "anchor baby"
    ],
    "Illegal/Undocumented Migrants": [
        "illegal immigrants", "undocumented migrants", "undocumented immigrants", "DACA", "deportation", "illegal aliens", "illegal alien", "illegal immigrant", 
        "undocumented migrant", "undocumented immigrant", "refugee", "asylum", "undocumented", "overstayed visa", "thugs and criminals", "ms-13", "ms 13", "gangs", 
        "dreamers", "daca", "sanctuary cities", "illegal immigrant",
    ],

    # Economy
    "Progressive Taxation": [
        "progressive tax", "wealth tax", "tax the rich", "income inequality", "top marginal tax rate", "flat tax", "tax brackets", "marginal tax rate", "capital gains", "tax loopholes", 
        "redistribution of wealth", "top 1%", "billionaires", "income inequality", "corporate welfare", "wealth hoarding", "hoard the wealth", "punishing success", "over-taxation", 
        "big government", "penalizing innovation", "tax burden", "economic mobility", "socialist", "socialism", "tax reform"
    ],
    "Regulations": [
        "regulation", "deregulation", "red tape", "regulations", "market oversight", "consumer protection", "labor laws", "labor regulation", "minimum wage", "livable wage", 
        "fair wage", "corporate accountability", "protecting consumers", "environmental protections", "government overreach", "free market", "private sector", "small business", 
        "government interference",  "government oversight", "price gouging", "price caps", "corporate accountability", "the union", "labor unions", "monopolies", "monopoly", 
        "financial safeguards", "labor rights", "right to work", "right-to-work", "big banks", "green new deal", "social security", "fair trade"
    ],
    "Tariffs": [
        "tariffs", "import tax", "trade war", "tariff policy", "reciprocal tariffs", "protectionism", "foreign competition", "import duty", "export tax", "protect american jobs", 
        "unfair trade", "america first", "domestic production", "made in america", "fair trade", "free trade", "hidden tax", "consumers will pay", "tax on consumers", 
        "cost for consumers", "passed on to consumers", "small business", "inflation", "trade policy", "trade terms", "united states-mexico-canada agreement", "usmca"
    ],
    "Balancing the Budget": [
        "federal deficit", "balance the budget", "cut government spending", "national debt", "Department of Government Efficiency", "DOGE", "eliminate waste", "reduce waste", "wasteful spending", "austerity"
    ],

    # Healthcare
    "Public Healthcare": [
        "public healthcare", "Medicare for All", "universal healthcare", "government-run healthcare"
    ],
    "Private Healthcare": [
        "private insurance", "employer-based coverage", "healthcare choice", "private health plans"
    ],
    "Medicare Expansion": [
        "expand Medicare", "Medicare age", "add dental to Medicare", "Medicare benefits"
    ],
    "Limits on Prescription Drug Prices": [
        "prescription drug prices", "cap insulin", "drug pricing reform", "pharmaceutical companies", "lower drug costs", "insulin"
    ],

    # Education
    "Student Loan Forgiveness": [
        "student loan forgiveness", "student debt", "college debt relief", "loan forgiveness programs", "student loans"
    ],
    "Public School Funding": [
        "public school funding", "teacher pay", "education budget", "support public schools"
    ],
    "School Choice": [
        "school vouchers", "charter schools", "school choice", "education freedom", "education savings accounts"
    ],
    "Affirmative Action": [
        "affirmative action", "race in admissions", "college admissions diversity", "race-conscious admissions"
    ],

    # Environment
    "Renewable Energy": [
        "renewable energy", "wind power", "solar energy", "clean energy", "green energy", "sustainable energy"
    ],
    "Nuclear Energy": [
        "nuclear energy", "nuclear power", "nuclear reactors", "zero-emission energy"
    ],
    "Carbon Emissions Controls": [
        "carbon emissions", "greenhouse gases", "carbon tax", "net-zero", "carbon footprint"
    ],
    "Pollutant Controls": [
        "air pollution", "clean water", "toxic waste", "industrial runoff", "environmental protection"
    ],

    # Civil Liberties
    "Background Checks": [
        "background checks", "universal background checks", "gun show loophole", "firearm purchase checks"
    ],
    "Assault Weapons Ban": [
        "assault weapons", "ban AR-15", "military-style rifles", "weapons of war", "high-capacity rifles"
    ],
    "Gun Ownership": [
        "gun ownership", "right to bear arms", "Second Amendment", "self-defense rights"
    ],
    "Ammunition Restrictions": [
        "high-capacity magazines", "ammo restrictions", "magazine size limits", "armor-piercing rounds"
    ]
}

source_urls = {
    "Kamala Harris": "https://kamalaharris.com",
    "Donald Trump": "https://www.donaldjtrump.com",
    "Ruben Gallego": "http://gallegoforarizona.com/",
    "Kari Lake": "https://karilake.com ",
    "Elissa Slotkin": "https://elissaslotkin.org ",
    "Mike Rogers": "https://rogersforsenate.com",
    "Jacky Rosen": "https://www.rosen.senate.gov",
    "Sam Brown": "https://www.captainsambrown.com",
    "Dave McCormick": "https://www.davemccormickpa.com",
    "Bob Casey": "https://bobcasey.com",
    "Tammy Baldwin": "https://www.tammybaldwin.com",
    "Marsha Blackburn": "https://www.marshablackburn.com",
    "Gloria Johnson": "https://www.votegloriajohnson.com",
    "Rick Scott": "https://rickscott.com",
    "Debbie Mucarsel-Powell": "https://www.debbieforflorida.com",
    "Steven Cohen": "http://cohenforcongress.com",
    "Charlotte Bergmann": "https://electbergmann.com",
    "Tim Burchett": "https://www.burchettforcongress.com",
    "Jane George": "https://janegeorgetn.com",
    "John Rose": "https://johnrose.com",
    "Lore Bergman": "https://lorebergman.org/platform/",
    "Andy Ogles": "https://andyogles.com",
    "Mark Green": "https://markgreentn.com",
    "Marjorie Taylor Greene": "https://www.mtgforamerica.com",
    "Shawn Harris": "https://www.shawnforgeorgia.com",
    "Don Davis": "https://votedondavis.com",
    "Laurie Buckhout": "https://www.lauriebuckhoutforcongress.com",
    "Gay Valimont": "https://gayforcongress.com",
}
candidate_sources = {
    "Andy Ogles": [
        {"path": "campaign-sites/andy_ogles_tn_house.txt", "type": "Campaign Website", "url": "https://andyogles.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website", "url": "http://ogles.house.gov"},
    ],
    "Bob Casey": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Charlotte Bergmann": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://electbergmann.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Dave Mccormick": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://davemccormickpa.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Debbie Murcasel Powell": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://debbieforflorida.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Don Davis": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://votedondavis.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Donald Trump": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://donaldjtrump.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Elissa Slotkin": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://elissaslotkin.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Gay Valimont": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://gayforcongress.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Gloria Johnson": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://votegloriajohnson.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Jacky Rosen": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://rosen.senate.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Jane George": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://janegeorgetn.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "John Rose": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://johnrose.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Kamala Harris": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://kamalaharris.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Kari Lake": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://karilake.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Laurie Buckhout": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Lore Bergman": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Marjorie Taylor Greene": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Mark Green": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Marsha Blackburn": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Megan Barry": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Mike Rogers": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Rick Scott": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Ruben Gallego": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Sam Brown": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Shawn Harris": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Steven Cohen": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Tammy Baldwin": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
    "Tim Burchett": [
        {"path": "campaign-sites/bob_casey_pa_senate.txt", "type": "Campaign Website", "url": "https://bobcasey.com" },
        {"path": "X-sites/AndyOgles.txt", "type": "Tweet"},
        {"path": "HS-sites/andy_ogles_house.gov", "type": "Gov Website"},
        {"path": "Candidates/Bob-Casey/interview_fox.txt", "type": "Interview"},
    ],
}

def precompute_issue_vectors(trigger_dict, nlp):
    issue_vectors = []
    for issue, phrases in trigger_dict.items():
        for phrase in phrases:
            vector = nlp(phrase).vector
            issue_vectors.append({
                "issue": issue,
                "phrase": phrase,
                "vector": vector
            })
    return issue_vectors

###################################
### --- Sentence Extraction --- ###
###################################
def extract_sentences(text, nlp, min_length=20):
    sentences = []
    cleaned = text.replace("\n", ". ")
    doc = nlp(cleaned)
    for sent in doc.sents:
        sentences.append(sent.text)
    return sentences

def export_sentences_to_txt(sentences, output_path):
    with open(output_path, "w", encoding="utf-8") as f:
        for i, sent in enumerate(sentences, 1):
            f.write(f"{i:03d}. {sent.strip()}\n")

######################################
### --- Filtering for Policies --- ###
######################################
def filter_policy_statements(sentences, nlp, author, matcher=None, min_score=3):
    filtered_sentences = []

    doc = nlp(" ".join(sentences))
    for sent in doc.sents:

        if is_potential_policy_sentence(sent, matcher=matcher, min_score=min_score):

            reply = check_policy_statement(sent.text).lower()

            if "no" in reply:
                continue

            reply = check_author(sent.text, author).lower()

            if "no" in reply:
                continue
            
            filtered_sentences.append(sent.text)

    return filtered_sentences


def check_policy_statement(statement):
    system_prompt = f"""
    Please identify if the following sentence is discussing policy:

    "{statement}"

    Here is a list of issues that may help with determining whether the sentence is discussing policy or not:
    {issue_list}

    If it is a policy relevant statement, reply "Yes", otherwise if it is irrelevant (so if it's about fundraising or legal disclaimers or something else) reply "No".
    Also, reply "No" if this is about attacking someone else's policy. Also reply "No" if the sentence appears to be cut short.

    State Yes/No below: 
    """

    response = chat(model='llama3.2', messages=[
        { 'role': 'user', 'content': system_prompt }
    ])

    return response.message.content.strip()


def check_author(statement, author):
    system_prompt = f"""
    Independent of other statements, could this statement reasonably come from and is about {author}?

    "{statement}"

    If the statement could have come from or is about {author}, reply "Yes", otherwise if it appears the statement was made by another person or entity, or is about another person or entity, reply "No".
    If the statement includes "I", "We", "Our", "He/She", "Her/His", the author's name, always reply "Yes." If it is only a fact, or explicity about another person, then reply "No". 

    State Yes/No below: 
    """

    response = chat(model='llama3.2', messages=[
        { 'role': 'user', 'content': system_prompt }
    ])

    return response.message.content.strip()

def is_potential_policy_sentence(doc, matcher=None, min_score=3):
    score = 0

    # Content Verb (not auxiliary or generic)
    if any(token.pos_ == "VERB" and not token.tag_.startswith("MD") for token in doc):
        score += 1

    # Known Stance Verbs
    stance_verbs = {"support", "oppose", "expand", "cut", "protect", "ban", "reform", "fight", "defend", "invest"}
    if any(token.lemma_.lower() in stance_verbs for token in doc if token.pos_ == "VERB"):
        score += 1

    # Noun overlap with policy terms
    if matcher and matcher(doc):
        score += 2

    # Named Entity (ORG, GPE, LAW, etc.)
    if any(ent.label_ in {"ORG", "LAW", "GPE", "NORP"} for ent in doc.ents):
        score += 1

    return score >= min_score

def get_policy_keywords(issue_trigger_phrases):
    keywords = set()
    for phrases in issue_trigger_phrases.values():
        for phrase in phrases:
            keywords.add(phrase.lower())
    return keywords

def make_policy_phrase_matcher(nlp, keyword_list):
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = [nlp.make_doc(kw) for kw in keyword_list]
    matcher.add("POLICY", patterns)
    return matcher

####################################
### --- Determining Position --- ###
####################################

def determine_positions(sentences, tweet=False):
    policy_positions = []

    for sentence in sentences:
        raw = classify_policy_statement(sentence)
        issue, stance, confidence = parse_llm_response(raw)

        if issue == None or issue.lower() == "none":
            continue
        if stance == None or stance.lower() == "none":
            continue
        if confidence == None or confidence == 0:
            continue

        if issue != "None" and stance != "None" and confidence > 0.5:
            if tweet:
                confidence /= 3

            policy_positions.append((sentence, issue, stance, confidence))
    return policy_positions


examples = """
    Example 1:
    Sentence: "With so much at stake, from families struggling with rising costs to a ban on reproductive freedom, Wisconsinites need someone who can show up, go to work, and get the job done."
    Issue: Abortion
    Stance: support
    Confidence: 0.7

    Example 2:
    Sentence: "Chip in to our reelection campaign today to help her defend this battleground seat and keep Wisconsin blue. Click on an option to get started."
    Issue: None
    Stance: None
    Confidence: 0.0

    Example 3:
    Sentence: "If you've saved your payment information with ActBlue Express, your donation will go through immediately"
    Issue: None
    Stance: None
    Confidence: 0.0

    Example 4:
    Sentence: "I’ll fight to restore your rights until you can make your own medical decisions without a politician or a judge standing in your way."
    Issue: Abortion
    Stance: support
    Confidence: 0.5

    Example 5:
    Sentence: "She stands up for our workers, our veterans, our students and our small business owners who need someone in Washington working for them"
    Issue: Regulations
    Stance: support
    Confidence: 0.3

    Example 6:
    Sentence: "He is leading the fight for stronger Made in America rules so our roads, bridges, and pipes are made with American iron and steel"
    Issue: Tariffs
    Stance: support
    Confidence: 0.5

    Example 7:
    Sentence: "He knows firsthand about the need to combat the opioid crisis."
    Issue: None
    Stance: None
    Confidence: 0.0

    Example 8:
    Sentence: "But no matter how much they throw against her, we will keep fighting as hard as ever for our families."
    Issue: None
    Stance: None
    Confidence: 0.0

    Example 9:
    Sentence: "Winning the Competition With China."
    Issue: China
    Stance: oppose
    Confidence: 0.8

    Example 10:
    Sentence: "It’s unconscionable for Kamala Harris to claim she’s serious about border security when, as Border Czar, she has allowed our nation to be invaded.. ."
    Issue: Illegal/Undocumented Migrants
    Stance: Oppose
    Confidence: 0.6

    Example 11:
    Sentence: "hen you post or otherwise share User Content on or through our Site, you understand that your User Content and any associated information (such as your username or profile photo) may be visible to others."
    Issue: None
    Stance: None
    Confidence: 0.0

    Example 12:
    Sentence: "The Site, including the text, graphics, images, photographs, videos, illustrations and other content contained therein, are owned by the Committee or our licensors and are protected under both United States and foreign laws."
    Issue: None
    Stance: None
    Confidence: 0.0

    Example 13:
    Sentence: "Baldwin pointed to a recent victory she and other members of the Health, Education, Labor and Pensions Committee claimed after investigating the price gouging practices of top manufacturers of inhalers — three of the four companies later agreed to lower patients’ out-of-pocket costs by more than $100 per inhaler.."
    Issue: Limits on Prescription Drug Prices
    Stance: support
    Confidence: 0.9

    Example 14:
    Sentence: "I just think you can't be a Wisconsinite and not be deeply caring about our water."
    Issue: Pollutant Controls
    Stance: support
    Confidence: 0.6

    Example 15:
    Sentence: "He fights to secure our border"
    Issue: Border Patrol
    Stance: support
    Confidence: 0.7
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

    If the sentence does not appear policy relevant (so if it's about donations or some technical legal jargon) or if no policy issue from the list is relevant to the sentence, reply:

    Issue: None
    Stance: None
    Confidence: 0.0

    Be certain that the issue matches. Much of what will be provided will be effectively noise, so do not make mistakes.

    Begin your response below:
    Issue: 
    """

    response = chat(model='llama3.2', messages=[
        { 'role': 'user', 'content': system_prompt }
    ])

    return response.message.content.strip()


def parse_llm_response(response):
    issue = None
    stance = None
    confidence = None

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

############################################
### --- Logging Sentences & Decision --- ###
############################################

####################################
### --- Aggregate Statements --- ###
####################################

##############################
### --- Adding Context --- ###
##############################

def get_all_sources_by_type(candidate_name, candidate_folder):
    """
    Iterate through a candidate's folder and gather all files by source type.
    Each source type (Campaign Website, Gov Website, Tweet, Other) is a subfolder.
    """
    valid_types = ["Campaign Website", "Gov Website", "Tweet", "Other"]
    all_sources = []

    for source_type in valid_types:
        type_folder = os.path.join(candidate_folder, source_type)
        if not os.path.exists(os.path.join('../scraper/', type_folder)):
            continue

        for filename in os.listdir(os.path.join('../scraper/', type_folder)):
            file_path = os.path.join(type_folder, filename)
            if not filename.endswith(".txt"):
                continue

            all_sources.append({
                "candidate": candidate_name,
                "path": file_path,
                "type": source_type
            })

    return all_sources

def define_metadata(text, type, nlp, path, candidate, source_urls={}):
    lines = text.strip().splitlines()
    metadata = {
        "type": type,
        "url": None,
        "tweet": None,
        "date": None,
        "scraped_on": None,
    }

    if type == "Campaign Website":
        # Use predefined source list
        if candidate and candidate in source_urls:
            metadata["url"] = source_urls[candidate]
        else:
            metadata["url"] = None
        
        for line in lines:
            if line.lower().startswith("scraped on:"):
                metadata["scraped_on"] = line.split(":",1)[1].strip()
                metadata["date"] = metadata["scraped_on"]

    elif type == "Other":
        # First line has title + date, second line is URL
        date_match = re.search(r'\((.*?)\)', lines[0])
        if date_match:
            metadata["date"] = date_match.group(1)

        if len(lines) > 1 and "http" in lines[1]:
            metadata["url"] = lines[1].split("http", 1)[1].strip()
            metadata["url"] = "http" + metadata["url"]

        for line in lines:
            if line.lower().startswith("scraped on:"):
                metadata["scraped_on"] = line.split(":", 1)[1].strip()
    
    elif type == "Gov Website":
        for line in lines:
            if line.lower().startswith("scraped on:"):
                metadata["scraped_on"] = line.split(":", 1)[1].strip()
                metadata["date"] = metadata["scraped_on"]

            elif line.lower().startswith("website:"):
                metadata["url"] = line.split(":", 1)[1].strip()

    return metadata

def process_source(candidate, path, type, nlp, matcher):
    print("Processing:", path)

    if type == "Tweet":
        return process_tweets(candidate, path, nlp, matcher)

    text = db_handling.get_scraped_file_from_database(path)
    metadata = define_metadata(text, type, nlp, path, candidate, source_urls)

    print("Extracting...")
    sentences = extract_sentences(text, nlp)
    print("Filtering...")
    sentences = filter_policy_statements(sentences, nlp, candidate, matcher, 3)
    print("Parsing...")
    statements = determine_positions(sentences)

    data = []
    for statement in statements:
        data.append((statement, metadata))

    return data


def extract_tweets(text):
    tweets = []
    current_date = None
    current_tweet_lines = []
    scraped_on = None

    for line in text.strip().splitlines():
        if line.lower().startswith("scraped on:"):
            scraped_on = line.split(":", 1)[1].strip()
        elif re.match(r"\d{4}-\d{2}-\d{2}T", line):
            # Save the previous tweet
            if current_tweet_lines:
                tweets.append((
                    "\n".join(current_tweet_lines).strip(),
                    {
                        "type": "Tweet",
                        "url": None,
                        "tweet": "\n".join(current_tweet_lines).strip(),
                        "date": current_date,
                        "scraped_on": scraped_on
                    }
                ))
                current_tweet_lines = []
            current_date = line.strip()
        else:
            current_tweet_lines.append(line)

    if current_tweet_lines:
        tweets.append((
            "\n".join(current_tweet_lines).strip(),
            {
                "type": "Tweet",
                "url": None,
                "tweet": "\n".join(current_tweet_lines).strip(),
                "date": current_date,
                "scraped_on": scraped_on
            }
        ))

    return tweets

def process_tweets(candidate, path, nlp, matcher):
    print("Processing tweets from:", path)
    text = db_handling.get_scraped_file_from_database(path)
    tweet_entries = extract_tweets(text)

    results = []

    i = 0
    for tweet_text, metadata in tweet_entries:
        i += 1
        print("Processing tweet:", i)
        sentences = extract_sentences(tweet_text, nlp)
        sentences = filter_policy_statements(sentences, nlp, candidate, matcher, 3)
        statements = determine_positions(sentences, True)

        for statement in statements:
            results.append((statement, metadata))

    return results

def gather_descr_sentences(issue_scores, sentence_data, policy):
    relevant = []
    hyper_relevant = []
    for sentence, issue, stance, confidence, meta in sentence_data:
        if issue.lower() != policy.lower():
            continue
        if issue_scores[issue]["stance"] != stance:
            continue
        
        relevant.append(sentence)

        if not any(phrase.lower() in sentence.lower() for phrase in issue_trigger_phrases.get(issue, [])):
            continue
        if confidence < 0.8:
            continue
        
        hyper_relevant.append(sentence)
    
    selected = hyper_relevant if len(hyper_relevant) > 2 else relevant
    return selected
        
def get_descr(issue_scores, candidate, sentence_data, policy):
    selected_sentences = gather_descr_sentences(issue_scores, sentence_data, policy)
    if len(selected_sentences) < 3:
        return "Insufficient Data"
    
    joined = "\n\n".join(selected_sentences)
    system_prompt = f"""
    Summarize {candidate}'s stance on {policy} in 1-5 sentences. Summarize it as if it were part of a description.

    For example, in regards to balancing the budget:
    John Doe has put forth policy proposals to tighten the budget. He supports passing an amendment to limit government spending during peacetime. He also supports DOGE, stating that 'to increase the efficiency of government is a good idea.'

    If you are not provided anything, if the data is insufficient to properly summarize their position, or if not enough data is relevant to the policy to warrant a summary, merely reply (without adding any words):
    Insufficient Data.

    {joined}
    """

    response = chat(model='llama3.2', messages=[
        { 'role': 'user', 'content': system_prompt }
    ])

    return response.message.content.strip()

######################
### --- Export --- ###
######################
def do_candidate(candidate_name, output_path, nlp, matcher):
    print("Candidate", candidate_name, "started:")
    per_issue_scores = defaultdict(lambda: {"support": 0.0, "oppose": 0.0})

    sources = get_all_sources_by_type(candidate_name, "Candidates/" + candidate_name)
    all_data = []
    for source in sources:
        data = process_source(candidate_name, source["path"], source["type"], nlp, matcher)
        for statement, metadata in data:
            sent, issue, stance, conf = statement
            if issue == None:
                continue
            if stance != "support" and stance != "oppose":
                continue
            if conf == 0.0:
                continue
            per_issue_scores[issue][stance] += conf
            all_data.append((sent, issue, stance, conf, metadata))
            # print(sent, "\n", issue, stance, conf)

    export_to_json(candidate_name, per_issue_scores, all_data, output_path)
    print("Candidate Done!")

def export_to_json(candidate_name, issue_scores, sentence_data, output_path):
    """
    Export structured stance data to JSON in the exact desired format.

    Parameters:
    - candidate_name: str
    - issue_scores: support/oppose scores for each issue
    - sentence_data: list of dicts or tuples in format:
        (sentence, issue, stance, confidence, metadata_dict)
    - output_path: str
    """

    output = {
        "candidate": candidate_name,
        "positions": []
    }

    for issue, counts in issue_scores.items():
        support = counts['support']
        oppose = counts['oppose']
        issue_scores[issue]["stance"] = "neutral"

        stance_bool = False
        if support > oppose + 2 and support > oppose * 2:
            issue_scores[issue]["stance"] = "support"
            stance_bool = True
        elif oppose > support + 2 and oppose > support * 2:
            issue_scores[issue]["stance"] = "oppose"
        else:
            continue

        # Create source data
        unique_sources = set()
        for sentence, policy, stance, confidence, meta in sentence_data:
            if policy.lower() != issue.lower():
                continue
            if stance != issue_scores[issue]["stance"]:
                continue

            # Create a unique key for the source
            source_key = (
                meta.get("type", "Unknown"),
                meta.get("url", None),
                meta.get("tweet", None),
                meta.get("date", None),
                meta.get("scraped_on", None)
            )
            unique_sources.add(source_key)

        # Convert back to dicts for JSON
        source_dicts = [
            {
                "type": s[0],
                "url": s[1],
                "tweet": s[2],
                "date": s[3],
                "scraped_on": s[4]
            }
            for s in unique_sources
        ]

        issue_group = {
            "issue": issue,
            "stance": stance_bool,
            "desc": get_descr(issue_scores, candidate_name, sentence_data, issue),
            "sources": source_dicts
        }
        
        output["positions"].append(issue_group)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)



################################################################################################
################################################################################################


### --- Setup --- ###
print("Beginning NLP")
nlp = spacy.load("en_core_web_lg")

policy_keywords = {
    "abortion", "medicare", "healthcare", "nato", "carbon", "minimum wage", "tax",
    "immigration", "gun", "energy", "opioid", "prison", "student loans", "social security",
    "budget", "china", "israel", "ukraine", "border", "school", "fentanyl", "transgender",
    "nuclear", "climate", "housing", "tariffs", "trade", "pollution"
}
policy_keywords = policy_keywords.union(get_policy_keywords(issue_trigger_phrases))
matcher = make_policy_phrase_matcher(nlp, policy_keywords)
cached_issue_vectors = precompute_issue_vectors(issue_trigger_phrases, nlp)

candidates = [
    "Ruben Gallego",
    "Kari Lake",
    "Elissa Slotkin",
    "Mike Rogers",
    "Jacky Rosen",
    "Sam Brown",
    "Dave McCormick",
    "Bob Casey",
    "Tammy Baldwin",
    "Marsha Blackburn",
    "Gloria Johnson",
    "Rick Scott",
    "Debbie Mucarsel-Powell",
    "Steven Cohen",
    "Charlotte Bergmann",
    "Tim Burchett",
    "Jane George",
    "John Rose",
    "Lore Bergman",
    "Andy Ogles",
    "Mark Green",
    "Marjorie Taylor Greene",
    "Shawn Harris",
    "Don Davis",
    "Laurie Buckhout",
    "Gay Valimont"
]

for candidate_name in candidates:
    do_candidate(candidate_name, candidate_name.replace(" ", "_").lower() + ".json", nlp, matcher)

# results = process_tweets("Andy Ogles", "dest-txt/X-sites/AndyOgles.txt", nlp, matcher)
# for result in results:
#     print(result[0], "\n")

### --- Sentence Extraction --- ###
# metadata = source
# sentences = extract_sentences(text, nlp)

# ### --- Filtering for Policies, Attribution --- ###
# print("Sentence Count Before Filtering:", len(sentences))
# sentences = filter_policy_statements(sentences, nlp, "Tammy Baldwin", matcher, 3)
# print("Sentence Count After Filtering:", len(sentences))

# ### --- Determining Policy & Position --- ###
# statements = determine_positions(sentences)
# print("Policy Statements:", len(statements))

# ### --- Aggregate Statements --- ###
# for sent, issue, stance, conf in statements:
#     per_issue_scores[issue][stance] += conf
#     print(sent, "\n", issue, stance, conf)

# for issue, counts in per_issue_scores.items():
#     support = counts['support']
#     oppose = counts['oppose']
#     supports = False

#     if support > oppose + 2:
#         print(f"Policy: {issue}")
#         print(f"  Support")
#         supports = True
#     elif oppose > support + 2:
#         print(f"Policy: {issue}")
#         print(f"  Oppose")
        


### --- Adding Context --- ###



### --- Export --- ###
# export_sentences_to_txt(sentences, "statements.txt")
print("Done")