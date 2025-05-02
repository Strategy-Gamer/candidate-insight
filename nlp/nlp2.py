import db_handling
import spacy
import numpy as np
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from spacy.matcher import PhraseMatcher
from transformers import AutoTokenizer, AutoModelForCausalLM
from ollama import chat
from ollama import ChatResponse
import pandas as pd
import re

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

def determine_positions(sentences):
    policy_positions = []

    for sentence in sentences:
        raw = classify_policy_statement(sentence)
        issue, stance, confidence = parse_llm_response(raw)

        # try:
        #     fconf = float(confidence)
        # except ValueError as e:
        #     continue

        if issue != "None" and stance != "None" and confidence > 0.5:
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
Sentence: ""
Issue: None
Stance: None
Confidence: 0.0

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

    Do not be afriad to label data as having no issue. Much of what will be provided will be effectively noise.

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

######################
### --- Export --- ###
######################


################################################################################################
################################################################################################


### --- Setup --- ###
print("Beginning NLP")
nlp = spacy.load("en_core_web_lg")
text = db_handling.get_scraped_file_from_database("campaign-sites/tammy_baldwin_wi_senate.txt")

policy_keywords = {
    "abortion", "medicare", "healthcare", "nato", "carbon", "minimum wage", "tax",
    "immigration", "gun", "energy", "opioid", "prison", "student loans", "social security",
    "budget", "china", "israel", "ukraine", "border", "school", "fentanyl", "transgender",
    "nuclear", "climate", "housing", "tariffs", "trade", "pollution"
}
policy_keywords = policy_keywords.union(get_policy_keywords(issue_trigger_phrases))
matcher = make_policy_phrase_matcher(nlp, policy_keywords)
cached_issue_vectors = precompute_issue_vectors(issue_trigger_phrases, nlp)

per_issue_scores = defaultdict(lambda: {"support": 0.0, "oppose": 0.0})

sources = [("Campaign Website", "https://www.tammybaldwin.com"), ("Tweet", "I have a lot to say.")]

### --- Sentence Extraction --- ###
sentences = extract_sentences(text, nlp)

### --- Filtering for Policies, Attribution --- ###
print("Sentence Count Before Filtering:", len(sentences))
sentences = filter_policy_statements(sentences, nlp, "Tammy Baldwin", matcher, 3)
print("Sentence Count After Filtering:", len(sentences))

### --- Determining Policy & Position --- ###
statements = determine_positions(sentences)
print("Policy Statements:", len(statements))

### --- Aggregate Statements --- ###
for sent, issue, stance, conf in statements:
    per_issue_scores[issue][stance] += conf
    print(sent, "\n", issue, stance, conf)

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
export_sentences_to_txt(sentences, "statements.txt")
print("Done")