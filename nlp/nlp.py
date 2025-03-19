import db_handling
import spacy
from collections import defaultdict

# List of patterns, policies, and positions.
# Should eventually be moved into their own files

# Individual Policies
patterns = [
    {"label": "POLICY", "pattern": "Freedom to Choose"},
    {"label": "POLICY", "pattern": "Medicare for All"},
    {"label": "POLICY", "pattern": "Green New Deal"},
    {"label": "POLICY", "pattern": "LGBTQ+ Rights"},
    {"label": "POLICY", "pattern": "Drug Prices"},
    {"label": "POLICY", "pattern": "Opioid"},
    {"label": "POLICY", "pattern": "Fentanyl"},
    {"label": "POLICY", "pattern": "Infrastructure"},
    {"label": "POLICY", "pattern": "Made in America"}
]

# Where policies map onto issues
issue_mapping = {
    "Freedom to Choose": "Abortion Rights",
    "Pro-Choice": "Abortion Rights",
    "Reproductive Rights": "Abortion Rights",
    "LGBTQ+ Rights": "LGBTQ+ Rights",
    "Medicare for All": "Public Healthcare",
    "Universal Healthcare": "Public Healthcare",
    "Drug Prices": "Drug Price Controls",
    "Opioid": "Combatting the Opioid Epidemic",
    "Fentanyl": "Combatting the Opioid Epidemic",
    "Infrastructure": "Investing in Infrastructure",
    "Made in America": "Domestic Industry"
}

# Default is false, so only need to put true here
policy_negation = {
    "Drug Prices": True,
    "Opioid": True,
    "Fentanyl": True
}

position_keywords = {
    "support": "SUPPORT",
    "fight": "SUPPORT",
    "defend": "SUPPORT",
    "protect": "SUPPORT",
    "invest": "SUPPORT",
    "safeguard": "SUPPORT",
    "keep": "SUPPORT",
    "strengthen": "SUPPORT",
    "bolster": "SUPPORT",
    "secure": "SUPPORT",
    "raise": "SUPPORT",
    "lead": "SUPPORT",
    "oppose": "OPPOSE",
    "fight against": "OPPOSE",
    "reject": "OPPOSE",
    "lower": "OPPOSE",
    "combat": "OPPOSE",
    "taking": "OPPOSE",
    "confront": "OPPOSE",
    "resist": "OPPOSE",
    "counter": "OPPOSE",
    "contest": "OPPOSE"
}

## Helper Functions ##

# Returns policy positions in a doc
def get_policy_position(doc):
    
    positions = []
    for ent in doc.ents:        
        if ent.label_ == "POLICY":
            policy = ent.text

            # Find the word that will determine the stance
            verb = get_verb(doc, ent)

            # Check for negation
            negation = False
            for token in doc:
                if token.dep_ == "neg" and token.head == verb:
                    negation = True
                    break
            
            # Negation Part 2 (Policy itself)
            if policy_negation.get(policy, False):
                negation = not negation
            
            # Determine the stance
            if verb:
                stance = position_keywords.get(verb.lemma_, "UNKNOWN")
                if negation:
                    stance = "OPPOSE" if stance == "SUPPORT" else "SUPPORT"
                category = issue_mapping.get(policy, policy)  # Map to issue
                positions.append((category, stance))
    
    return positions

# Given a doc & a policy ent, gets the verb attached to that policy
def get_verb(doc, ent):
    # Find the governing verb - first checking subtree and if unknown, then do a broader search
    verb = None
    for token in ent.root.head.subtree:
        if token.pos_ == "VERB":
            verb = token
            break

    if verb != None and position_keywords.get(verb.lemma_, "UNKNOWN") != "UNKNOWN": 
        return verb
    

    for token in doc:
        if token.dep_ in ("ROOT", "xcomp", "ccomp") and token.pos_ == "VERB":
            if token.head == ent.root or ent.root in token.subtree:
                verb = token
                break


    return verb

# Gets the name of the candidate from the text
# NOTE - Candidate name should always be on 2nd line
def get_candidate(docs):
    doc = docs[1]

    return doc[2].text, doc[3].text

# Main
nlp = spacy.load("en_core_web_lg")

ruler = nlp.add_pipe("entity_ruler", before="ner")
ruler.add_patterns(patterns)

policy_counts = defaultdict(lambda: {"SUPPORT": 0, "OPPOSE": 0, "UNKNOWN": 0})
text = db_handling.get_scraped_file_from_database("tammy_baldwin_wi_senate.txt")
lines = text.splitlines()
docs = list(nlp.pipe(lines))

candidate = get_candidate(docs)
print(candidate)
for doc in docs:
    positions = get_policy_position(doc)
    for position in positions:
        policy_counts[position[0]][position[1]] += 1

# Determine Position based on counts
file = open(candidate[0].lower() + "_" + candidate[1].lower() + "_positions.txt", "w")
for policy, counts in policy_counts.items():
    print(f"Policy: {policy}")
    print(f"  SUPPORT: {counts['SUPPORT']}")
    print(f"  OPPOSE: {counts['OPPOSE']}")
    print(f"  UNKNOWN: {counts['UNKNOWN']}")
    print()

    if counts["SUPPORT"] > counts["OPPOSE"]:
        file.write("Supports " + policy + "\n")
        #db_handling.push_position_to_database(candidate[0], candidate[1], policy, "Supports")
    elif counts["SUPPORT"] < counts["OPPOSE"]:
        file.write("Opposes " + policy + "\n")
        #db_handling.push_position_to_database(candidate[0], candidate[1], policy, "Opposes")
    