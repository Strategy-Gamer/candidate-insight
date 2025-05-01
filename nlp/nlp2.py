import db_handling
import spacy
import numpy as np
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from spacy.matcher import PhraseMatcher

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
        "military spending", "defense budget", "the military", "defense funding", "cut military budget", "military-industrial complex", "endless wars", "defense contractor",  "national defense", "deterrent", "DoD", "Department of Defense"
    ],

    # Social Issues
    "Abortion": [
        "abortion", "reproductive rights", "pro-choice", "pro-life", "right to choose", "unborn children"
    ],
    "Transgender Rights": [
        "trans rights", "transgender athletes", "gender identity", "gender-affirming care", "bathroom bills"
    ],
    "Election Integrity": [
        "election fraud", "secure elections", "voter ID", "mail-in voting", "election transparency", "ballot integrity"
    ],
    "Diversity, Equity, Inclusion": [
        "DEI", "diversity", "equity", "inclusion", "anti-racism", "woke", "wokeness"
    ],

    # Immigration
    "Border Patrol": [
        "border patrol", "ICE raids", "immigration checkpoints", "border crossings", "southern border"
    ],
    "Border Wall": [
        "border wall", "border fence", "build the wall", "finish the wall", "wall at the border"
    ],
    "Decreasing Immigration": [
        "legal immigration", "green card limits", "visa lottery", "immigration quotas", "chain migration", "anchor babies", "melting pot"
    ],
    "Illegal/Undocumented Migrants": [
        "illegal immigrants", "undocumented migrants", "undocumented immigrants", "DACA", "deportation", "illegal aliens", "illegal alien", "illegal immigrant", "undocumented migrant", "undocumented immigrant"
    ],

    # Economy
    "Progressive Taxation": [
        "progressive tax", "wealth tax", "tax the rich", "income inequality", "top marginal tax rate", "flat tax"
    ],
    "Regulations": [
        "regulation", "deregulation", "red tape", "regulations"
    ],
    "Tariffs": [
        "tariffs", "import tax", "trade war", "tariff policy", "reciprocal tariffs", "protectionism", "foreign competition"
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

###########################
### --- Attribution --- ###
###########################

######################################
### --- Filtering for Policies --- ###
######################################
def filter_policy_statements(sentences, nlp, matcher=None, min_score=3):
    filtered_sentences = []

    doc = nlp(" ".join(sentences))
    for sent in doc.sents:

        if is_potential_policy_sentence(sent, matcher=matcher, min_score=min_score):
            filtered_sentences.append(sent.text)

    return filtered_sentences


def is_potential_policy_sentence(doc, matcher=None, min_score=3):
    score = 0

    # Content Verb (not auxiliary or generic)
    if any(token.pos_ == "VERB" and not token.tag_.startswith("MD") for token in doc):
        score += 1
    
    # Modal Verb
    if any(token.tag_ == "MD" for token in doc):
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

#####################################
### --- Policy Identification --- ###
#####################################

####################################
### --- Determining Position --- ###
####################################

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
policy_keywords.union(get_policy_keywords(issue_trigger_phrases))
matcher = make_policy_phrase_matcher(nlp, policy_keywords)


### --- Sentence Extraction --- ###
sentences = extract_sentences(text, nlp)


### --- Attribution --- ###



### --- Filtering for Policies --- ###
print("Sentence Count Before Filtering:", len(sentences))
sentences = filter_policy_statements(sentences, nlp, matcher, 3)
print("Sentence Count After Filtering:", len(sentences))


### --- Determining Position --- ###



### --- Logging Sentences & Decision --- ###



### --- Aggregate Statements --- ###



### --- Adding Context --- ###



### --- Export --- ###
export_sentences_to_txt(sentences, "statements.txt")
print("Done")