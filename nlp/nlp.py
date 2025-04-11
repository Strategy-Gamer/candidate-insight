import db_handling
import spacy
import numpy as np
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

# List of patterns, policies, and positions.
# Should eventually be moved into their own files

issue_stance_phrases = {
    # Foreign Policy
    "Ukraine War": {"support": [], "oppose": []},
    "Israel-Gaza War": {"support": [], "oppose": []},
    "China": {"support": [], "oppose": []},
    "Iran": {"support": [], "oppose": []},
    "NATO Expansion": {"support": [], "oppose": []},
    "Military Spending": {"support": [], "oppose": []},

    # Social Issues
    "Drug Legalization": {"support": [], "oppose": []},
    "Opioid Crisis": {"support": [], "oppose": []},
    "Justice Reform": {"support": [], "oppose": []},
    "Abortion": {"support": [], "oppose": []},
    "NASA Funding": {"support": [], "oppose": []},
    "Gay Marriage": {"support": [], "oppose": []},
    "Transgender Rights": {"support": [], "oppose": []},
    "Election Integrity": {"support": [], "oppose": []},
    "Diversity, Equity, Inclusion": {"support": [], "oppose": []},

    # Immigration
    "Border Patrol": {"support": [], "oppose": []},
    "Border Wall": {"support": [], "oppose": []},
    "Decreasing Immigration": {"support": [], "oppose": []},
    "Illegal/Undocumented Migrants": {"support": [], "oppose": []},

    # Economy
    "Higher Minimum Wage": {"support": [], "oppose": []},
    "Tax Cuts": {"support": [], "oppose": []},
    "Progressive Taxation": {"support": [], "oppose": []},
    "Regulations": {"support": [], "oppose": []},
    "Trade Barriers": {"support": [], "oppose": []},
    "Tariffs": {"support": [], "oppose": []},
    "Balancing the Budget": {"support": [], "oppose": []},
    "Social Security Reform": {"support": [], "oppose": []},
    "Subsidized Housing": {"support": [], "oppose": []},

    # Healthcare
    "Public Healthcare": {"support": [], "oppose": []},
    "Private Healthcare": {"support": [], "oppose": []},
    "Medicare Expansion": {"support": [], "oppose": []},
    "Limits on Prescription Drug Prices": {"support": [], "oppose": []},

    # Education
    "Student Loan Forgiveness": {"support": [], "oppose": []},
    "Public School Funding": {"support": [], "oppose": []},
    "School Choice": {"support": [], "oppose": []},
    "Parental Rights": {"support": [], "oppose": []},
    "Affirmative Action": {"support": [], "oppose": []},

    # Environment
    "Renewable Energy": {"support": [], "oppose": []},
    "Nuclear Energy": {"support": [], "oppose": []},
    "Carbon Emissions Controls": {"support": [], "oppose": []},
    "Pollutant Controls": {"support": [], "oppose": []},

    # Gun Control
    "Background Checks": {"support": [], "oppose": []},
    "Assault Weapons Ban": {"support": [], "oppose": []},
    "Gun Ownership": {"support": [], "oppose": []},
    "Automatic Weapons Ban": {"support": [], "oppose": []},
    "Ammunition Restrictions": {"support": [], "oppose": []},
}

issue_trigger_phrases = {
    # Foreign Policy
    "Ukraine War": [
        "Ukraine", "Russian invasion", "aid to Ukraine", "Ukrainian military", "war in Ukraine", "arming Ukraine"
    ],
    "Israel-Gaza War": [
        "Israel", "Gaza", "Palestine", "Hamas", "support for Israel", "support for Palestine", "Middle East conflict"
    ],
    "China": [
        "China", "Chinese government", "Chinese influence", "Chinese Communist Party", "trade with China"
    ],
    "Iran": [
        "Iran", "Iran deal", "JCPOA", "Iranian regime", "Tehran", "sanctions on Iran", "support for Iranian protests"
    ],
    "NATO Expansion": [
        "NATO", "NATO expansion", "Ukraine NATO", "Sweden NATO", "Finland NATO", "Eastern Europe NATO"
    ],
    "Military Spending": [
        "military spending", "defense budget", "rebuild the military", "defense funding", "cut military budget"
    ],

    # Social Issues
    "Drug Legalization": [
        "marijuana", "cannabis", "drug decriminalization", "legalize drugs", "war on drugs", "drug possession"
    ],
    "Opioid Crisis": [
        "opioid", "fentanyl", "drug overdose", "substance abuse crisis", "opioid epidemic"
    ],
    "Justice Reform": [
        "prison reform", "justice reform", "mass incarceration", "mandatory minimums", "criminal justice system"
    ],
    "Abortion": [
        "abortion", "reproductive rights", "pro-choice", "pro-life", "right to choose", "unborn children"
    ],
    "NASA Funding": [
        "NASA", "space program", "fund space exploration", "moon mission", "space research"
    ],
    "Gay Marriage": [
        "gay marriage", "same-sex marriage", "marriage equality", "LGBTQ marriage rights"
    ],
    "Transgender Rights": [
        "trans rights", "transgender athletes", "gender identity", "gender-affirming care", "bathroom bills"
    ],
    "Election Integrity": [
        "election fraud", "secure elections", "voter ID", "mail-in voting", "election transparency", "ballot integrity"
    ],
    "Diversity, Equity, Inclusion": [
        "DEI", "diversity training", "equity programs", "inclusion initiatives", "unconscious bias", "anti-racism training"
    ],
    "Parental Rights": [
        "parental rights", "curriculum transparency", "parents' rights in education", "school board accountability"
    ],

    # Immigration
    "Border Patrol": [
        "border patrol", "ICE raids", "immigration checkpoints", "border crossings", "southern border crisis"
    ],
    "Border Wall": [
        "border wall", "border fence", "build the wall", "finish the wall", "wall at the border"
    ],
    "Decreasing Immigration": [
        "reduce legal immigration", "green card limits", "visa lottery", "immigration quotas", "end chain migration"
    ],
    "Illegal/Undocumented Migrants": [
        "illegal immigrants", "undocumented migrants", "undocumented immigrants", "DACA", "deportation"
    ],

    # Economy
    "Higher Minimum Wage": [
        "minimum wage", "$15 an hour", "living wage", "raise the wage", "federal minimum wage"
    ],
    "Tax Cuts": [
        "tax cuts", "lower taxes", "cut taxes", "reduce income tax", "Trump tax cuts"
    ],
    "Progressive Taxation": [
        "progressive tax", "wealth tax", "tax the rich", "income inequality", "top marginal tax rate"
    ],
    "Regulations": [
        "regulation", "deregulation", "red tape", "federal regulations", "cutting regulations"
    ],
    "Trade Barriers": [
        "trade barriers", "protectionism", "restrict imports", "foreign competition", "free trade agreements"
    ],
    "Tariffs": [
        "tariffs", "import tax", "trade war", "tariff policy", "reciprocal tariffs"
    ],
    "Balancing the Budget": [
        "federal deficit", "balance the budget", "cut government spending", "national debt", "Department of Government Efficiency"
    ],
    "Social Security Reform": [
        "social security", "retirement benefits", "entitlement reform", "cut social security", "protect social security"
    ],
    "Subsidized Housing": [
        "public housing", "affordable housing", "housing assistance", "HUD", "housing vouchers"
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
        "prescription drug prices", "cap insulin", "drug pricing reform", "pharmaceutical companies", "lower drug costs"
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

    # Gun Control
    "Background Checks": [
        "background checks", "universal background checks", "gun show loophole", "firearm purchase checks"
    ],
    "Assault Weapons Ban": [
        "assault weapons", "ban AR-15", "military-style rifles", "weapons of war", "high-capacity rifles"
    ],
    "Gun Ownership": [
        "gun ownership", "right to bear arms", "Second Amendment", "self-defense rights"
    ],
    "Automatic Weapons Ban": [
        "automatic weapons", "machine guns", "fully automatic firearms", "federal gun bans"
    ],
    "Ammunition Restrictions": [
        "high-capacity magazines", "ammo restrictions", "magazine size limits", "armor-piercing rounds"
    ]
}

issue_stance_phrases["Ukraine War"] = {
    "support": [
        "send more aid to Ukraine",
        "provide military support to Ukraine",
        "defend Ukraine against Russia",
        "arm Ukraine",
        "send weapons to Ukraine",
        "increase funding for Ukraine",
        "stand with Ukraine",
        "support Ukrainian resistance",
        "deploy troops to Eastern Europe",
        "strengthen NATO's presence near Ukraine"
    ],
    "oppose": [
        "stop sending aid to Ukraine",
        "end funding for the Ukraine war",
        "reduce military aid to Ukraine",
        "draw down support for Ukraine",
        "focus on domestic issues instead of Ukraine",
        "support a ceasefire in Ukraine",
        "push for peace talks with Russia",
        "oppose NATO involvement in Ukraine",
        "Ukraine is not our war",
        "stop escalating conflict with Russia"
    ]
}

issue_stance_phrases["Israel-Gaza War"] = {
    "support": [
        "support Israel's right to defend itself",
        "send military aid to Israel",
        "stand with Israel",
        "defend Israel against Hamas",
        "increase funding for Israeli defense",
        "condemn Hamas attacks",
        "oppose anti-Israel sentiment",
        "support Israeli strikes on Gaza",
        "protect Israeli sovereignty",
        "back Israel in the conflict"
    ],
    "oppose": [
        "stop sending aid to Israel",
        "call for a ceasefire in Gaza",
        "support Palestinian rights",
        "condemn Israeli airstrikes",
        "oppose Israeli occupation",
        "end U.S. support for Israel",
        "push for peace between Israel and Palestine",
        "support a two-state solution",
        "criticize Israeli government actions",
        "end the war in Gaza"
    ]
}

issue_stance_phrases["China"] = {
    "support": [
        "promote trade with China",
        "remove tariffs on Chinese goods",
        "ease tensions with China",
        "strengthen diplomatic relations with China",
        "cooperate with China on global issues",
        "support engagement with China",
        "oppose trade restrictions with China",
        "encourage U.S.-China partnership",
        "oppose escalation with China",
        "restore normal trade relations with China"
    ],
    "oppose": [
        "impose tariffs on Chinese goods",
        "hold China accountable",
        "ban Chinese companies from operating in the U.S.",
        "protect American interests against China",
        "restrict Chinese access to U.S. technology",
        "stand up to China",
        "limit trade with China",
        "counter Chinese aggression",
        "strengthen military presence in the Pacific",
        "combat China's global influence",
        "decouple from the Chinese economy"
    ]
}

issue_stance_phrases["Iran"] = {
    "support": [
        "rejoin the Iran nuclear deal",
        "restore the JCPOA",
        "engage diplomatically with Iran",
        "pursue peace with Iran",
        "ease sanctions on Iran",
        "support negotiations with Iran",
        "deescalate tensions with Iran",
        "promote diplomacy with Iran",
        "avoid conflict with Iran",
        "support Iranian civil society"
    ],
    "oppose": [
        "impose sanctions on Iran",
        "oppose the Iran nuclear deal",
        "withdraw from the JCPOA",
        "take a hard line on Iran",
        "punish Iran for its actions",
        "oppose negotiations with Iran",
        "support military action against Iran",
        "label Iran a threat",
        "confront Iran's aggression",
        "oppose appeasement of Iran",
        "support protests in Iran",
        "stand with the Iranian people",
        "support the Iranian opposition"
    ]
}

issue_stance_phrases["NATO Expansion"] = {
    "support": [
        "support NATO membership for Ukraine",
        "back Sweden and Finland joining NATO",
        "affirm NATO's importance",
        "NATO defends democratic allies",
        "support expanding NATO in Eastern Europe",
        "Russian aggression drives NATO expansion",
        "support NATO’s presence on Russia’s border",
        "defend NATO's enlargement",
        "NATO keeps Europe safe",
        "stand with NATO allies",
        "expanding NATO strengthens global security",
        "support Georgia's future NATO membership"
    ],
    "oppose": [
        "oppose NATO expansion",
        "question NATO's relevance",
        "blame NATO expansion for the Ukraine war",
        "criticize NATO's push into Eastern Europe",
        "warn against provoking Russia",
        "oppose Ukraine joining NATO",
        "NATO overreach causes instability",
        "oppose Sweden and Finland joining NATO",
        "NATO is obsolete",
        "expanding NATO is a mistake",
        "reject further NATO enlargement",
        "NATO expansion escalates tensions"
    ]
}

issue_stance_phrases["Military Spending"] = {
    "support": [
        "increase the defense budget",
        "rebuild our military",
        "invest in national defense",
        "modernize our armed forces",
        "expand military capabilities",
        "support more defense funding",
        "strengthen our military",
        "bolster defense spending",
        "ensure a strong military",
        "fund new weapons systems",
        "prepare for future conflicts",
        "support Pentagon funding"
    ],
    "oppose": [
        "cut military spending",
        "reduce defense funding",
        "spend less on foreign wars",
        "oppose endless wars",
        "shift military funds to domestic needs",
        "oppose bloated defense budgets",
        "reduce overseas military presence",
        "decrease Pentagon spending",
        "stop funding unnecessary wars",
        "redirect military funds to infrastructure"
    ]
}

issue_stance_phrases["Drug Legalization"] = {
    "support": [
        "legalize marijuana",
        "decriminalize drug possession",
        "end the war on drugs",
        "treat drug use as a public health issue",
        "support cannabis reform",
        "support safe injection sites",
        "support recreational marijuana",
        "expunge drug convictions",
        "end federal marijuana prohibition",
        "support drug policy reform"
    ],
    "oppose": [
        "oppose marijuana legalization",
        "keep drugs illegal",
        "support federal drug prohibition",
        "oppose decriminalization",
        "enforce strict drug laws",
        "oppose recreational cannabis",
        "oppose safe injection sites",
        "protect communities from drug abuse",
        "oppose drug legalization efforts",
        "continue the war on drugs"
    ]
}

issue_stance_phrases["Opioid Crisis"] = {
    "oppose": [
        "combat the opioid crisis",
        "crack down on fentanyl trafficking",
        "increase funding for addiction treatment",
        "address the drug overdose epidemic",
        "support recovery programs",
        "protect middle America from addiction",
        "help the forgotten communities suffering from opioids",
        "expand access to rehab services",
        "provide mental health and substance abuse treatment",
        "declare fentanyl a national emergency"
    ],
    "support": [
        "oppose funding for opioid treatment programs",
        "downplay the fentanyl crisis",
        "reduce resources for addiction treatment",
        "oppose harm reduction programs",
        "cut support for recovery centers",
        "ignore the needs of rural Americans hit by opioids",
        "oppose expanding public health efforts on opioids",
        "delay action on the opioid epidemic",
        "oppose bipartisan opioid legislation",
        "oppose cracking down on fentanyl trafficking"
    ]
}

issue_stance_phrases["Justice Reform"] = {
    "support": [
        "reform the justice system",
        "end mass incarceration",
        "eliminate mandatory minimums",
        "abolish cash bail",
        "promote rehabilitation over punishment",
        "invest in restorative justice",
        "reduce prison populations",
        "address racial disparities in sentencing",
        "end private prisons",
        "support second chances for nonviolent offenders"
    ],
    "oppose": [
        "oppose criminal justice reform",
        "defend tough-on-crime policies",
        "support mandatory minimum sentencing",
        "oppose eliminating cash bail",
        "prioritize punishment over rehabilitation",
        "expand prison capacity",
        "oppose early release programs",
        "support harsher sentencing",
        "oppose second chances for felons",
        "oppose reforming the prison system"
    ]
}

issue_stance_phrases["Abortion"] = {
    "support": [
        "supports abortion",
        "support pro-choice",
        "advocates for reproductive rights",
        "fighting for healthcare access",
        "defends the right to choose",
        "protects a woman's right to choose",
        "keep abortion safe and legal",
        "support abortion access",
        "oppose abortion bans",
        "stand with Planned Parenthood",
        "protect Roe v. Wade"
    ],
    "oppose": [
        "opposes abortion",
        "support pro-life",
        "support right to life",
        "protect unborn children",
        "against reproductive rights",
        "wants to ban abortion",
        "restrict access to abortion",
        "overturn Roe v. Wade",
        "oppose abortion rights",
        "pass heartbeat bills",
        "limit abortion after 6 weeks"
    ]
}

issue_stance_phrases["NASA Funding"] = {
    "support": [
        "increase NASA's budget",
        "invest in space exploration",
        "fund NASA missions",
        "expand America's space program",
        "support scientific research at NASA",
        "return to the moon",
        "support Mars exploration",
        "continue investment in NASA",
        "maintain leadership in space",
        "support NASA's future projects"
    ],
    "oppose": [
        "cut NASA funding",
        "reduce spending on space exploration",
        "divert NASA funds to other priorities",
        "oppose expanding NASA's budget",
        "question the cost of space programs",
        "oppose Mars missions",
        "criticize spending on NASA",
        "deprioritize space research",
        "focus on Earth, not space",
        "end costly space programs"
    ]
}

issue_stance_phrases["Gay Marriage"] = {
    "support": [
        "support same-sex marriage",
        "marriage equality is a right",
        "legalize gay marriage",
        "defend marriage equality",
        "equal rights for LGBTQ couples",
        "protect the right to marry",
        "stand with the LGBTQ community",
        "oppose efforts to overturn Obergefell",
        "support civil rights for gay couples",
        "love is love"
    ],
    "oppose": [
        "oppose same-sex marriage",
        "support traditional marriage",
        "marriage is between a man and a woman",
        "oppose gay marriage legalization",
        "defend religious freedom against gay marriage",
        "repeal marriage equality laws",
        "reverse Obergefell v. Hodges",
        "oppose redefining marriage",
        "stand for biblical marriage",
        "oppose same-sex unions"
    ]
}

issue_stance_phrases["Transgender Rights"] = {
    "support": [
        "support trans rights",
        "trans rights are human rights",
        "trans women are women",
        "affirm gender identity",
        "support gender-affirming care",
        "protect LGBTQ+ youth",
        "defend trans healthcare access",
        "oppose transphobia",
        "protect trans kids",
        "use chosen names and pronouns",
        "support bathroom access for trans people"
    ],
    "oppose": [
        "oppose gender-affirming care for minors",
        "ban sex-change surgeries for children",
        "biological sex is immutable",
        "sex is determined at birth",
        "oppose trans ideology",
        "trans women are not women",
        "keep men out of women's sports",
        "oppose pronoun mandates",
        "ban trans athletes from girls' sports",
        "oppose bathroom access based on gender identity",
        "protect children from gender confusion"
    ]
}

issue_stance_phrases["Election Integrity"] = {
    "support": [
        "implement voter ID laws",
        "require proof of citizenship to vote",
        "limit mail-in voting",
        "ban ballot drop boxes",
        "purge voter rolls",
        "oppose universal mail-in ballots",
        "restrict early voting periods",
        "enhance election security measures",
        "prevent noncitizen voting",
        "oppose same-day voter registration"
    ],
    "oppose": [
        "expand mail-in voting",
        "support automatic voter registration",
        "oppose voter ID requirements",
        "protect access to early voting",
        "oppose purging of voter rolls",
        "support same-day voter registration",
        "increase accessibility for voters with disabilities",
        "oppose restrictions on ballot drop boxes",
        "promote voter education initiatives",
        "oppose laws that limit voting access"
    ]
}

issue_stance_phrases["Diversity, Equity, Inclusion"] = {
    "support": [
        "promote diversity, equity, and inclusion",
        "invest in DEI programs",
        "hire DEI officers",
        "support inclusive workplace training",
        "create safe spaces for marginalized groups",
        "require unconscious bias training",
        "develop equity initiatives",
        "expand DEI offices",
        "increase diversity in hiring",
        "promote anti-racism initiatives",
        "commit to inclusive practices"
    ],
    "oppose": [
        "oppose DEI mandates",
        "ban DEI training in schools or workplaces",
        "criticize diversity hiring quotas",
        "oppose woke policies",
        "remove DEI offices",
        "oppose political indoctrination in institutions",
        "reject identity politics",
        "abolish DEI bureaucracies",
        "oppose equity-based decision-making",
        "call DEI programs discriminatory"
    ]
}

issue_stance_phrases["Border Patrol"] = {
    "support": [
        "increase funding for Border Patrol",
        "support ICE operations",
        "defend our border agents",
        "secure the southern border",
        "oppose defunding ICE",
        "expand border enforcement",
        "back the men and women of Border Patrol",
        "protect national security at the border",
        "support immigration enforcement",
        "invest in border security personnel"
    ],
    "oppose": [
        "abolish ICE",
        "defund Border Patrol",
        "end immigration raids",
        "criticize Border Patrol practices",
        "oppose deportations by ICE",
        "hold Border Patrol accountable",
        "reduce enforcement at the border",
        "invest in alternatives to ICE",
        "limit ICE detention authority",
        "oppose militarization of the border"
    ]
}

issue_stance_phrases["Border Wall"] = {
    "support": [
        "build the wall",
        "complete the border wall",
        "construct border fencing",
        "secure the border with a wall",
        "fund border wall construction",
        "support physical barriers at the southern border",
        "reinforce border security with fencing",
        "finish Trump's border wall",
        "expand the wall",
        "stop illegal crossings with a wall"
    ],
    "oppose": [
        "oppose building the wall",
        "tear down the border wall",
        "waste of money on fencing",
        "oppose physical barriers at the border",
        "the wall is ineffective",
        "stop border wall expansion",
        "oppose Trump's border wall",
        "focus on humane immigration policies instead of walls",
        "environmental damage from wall construction",
        "oppose wall funding"
    ]
}

issue_stance_phrases["Decreasing Immigration"] = {
    "support": [
        "reduce legal immigration",
        "end the visa lottery program",
        "limit green card eligibility",
        "restrict family-based immigration",
        "tighten immigration quotas",
        "prioritize skilled workers only",
        "pause legal immigration",
        "slow down immigration rates",
        "end chain migration",
        "decrease the number of immigrants admitted"
    ],
    "oppose": [
        "expand legal immigration",
        "increase green card availability",
        "support the visa lottery program",
        "welcome more immigrants",
        "streamline immigration processes",
        "ease immigration restrictions",
        "reform the system to allow more legal immigration",
        "oppose arbitrary immigration caps",
        "make it easier to immigrate to the U.S.",
        "support family reunification policies"
    ]
}

issue_stance_phrases["Illegal/Undocumented Migrants"] = {
    "support": [
        "pathway to citizenship for undocumented immigrants",
        "legalize undocumented workers",
        "provide aid to migrant families",
        "support DACA recipients",
        "oppose deportations of nonviolent immigrants",
        "support sanctuary cities",
        "allow undocumented immigrants to remain in the U.S.",
        "help migrants integrate into society",
        "protect undocumented communities",
        "expand asylum and refugee protections"
    ],
    "oppose": [
        "deport illegal immigrants",
        "cut illegal immigration to zero",
        "oppose sanctuary cities",
        "build up immigration enforcement",
        "crack down on illegal border crossings",
        "oppose amnesty for illegal aliens",
        "support mass deportations",
        "oppose giving benefits to undocumented migrants",
        "stop human trafficking at the border",
        "end catch and release policies"
    ]
}

issue_stance_phrases["Higher Minimum Wage"] = {
    "support": [
        "raise the minimum wage",
        "increase the federal minimum wage",
        "support a $15 minimum wage",
        "tie minimum wage to inflation",
        "ensure a living wage",
        "boost wages for low-income workers",
        "fight for fair pay",
        "raise wages for working families",
        "support wage increases",
        "end poverty wages"
    ],
    "oppose": [
        "oppose raising the minimum wage",
        "keep the minimum wage as it is",
        "minimum wage hikes kill jobs",
        "burdens small businesses",
        "let the market set wages",
        "raise wages through growth, not mandates",
        "oppose $15 minimum wage",
        "raising minimum wage increases unemployment",
        "wage floors hurt job creators",
        "state-level wage decisions, not federal"
    ]
}

issue_stance_phrases["Tax Cuts"] = {
    "support": [
        "cut taxes for working families",
        "lower the corporate tax rate",
        "reduce income taxes",
        "make tax cuts permanent",
        "support tax relief",
        "reduce the tax burden",
        "support lower taxes for everyone",
        "stimulate the economy through tax cuts",
        "oppose tax increases",
        "let people keep more of what they earn"
    ],
    "oppose": [
        "oppose tax cuts for the wealthy",
        "repeal the Trump tax cuts",
        "end corporate tax breaks",
        "tax cuts benefit the rich",
        "restore higher tax rates on top earners",
        "tax cuts starve public services",
        "increase taxes on the wealthy",
        "oppose regressive tax policies",
        "tax cuts increase the deficit",
        "reverse harmful tax cuts"
    ]
}

issue_stance_phrases["Progressive Taxation"] = {
    "support": [
        "tax the rich",
        "make the wealthy pay their fair share",
        "increase taxes on high-income earners",
        "implement a wealth tax",
        "close tax loopholes for the rich",
        "restore top marginal tax rates",
        "ensure a fair tax code",
        "raise taxes on millionaires and billionaires",
        "support progressive income tax",
        "oppose tax breaks for the wealthy"
    ],
    "oppose": [
        "oppose punishing success through taxes",
        "flat tax is fairer",
        "against raising taxes on job creators",
        "wealth taxes hurt investment",
        "progressive taxes discourage innovation",
        "oppose class warfare tax policies",
        "keep tax rates low across the board",
        "high earners already pay enough",
        "progressive taxation is unfair",
        "oppose income redistribution"
    ]
}

issue_stance_phrases["Regulations"] = {
    "support": [
        "hold corporations accountable",
        "support environmental regulations",
        "crack down on corporate abuse",
        "strengthen consumer protections",
        "regulate Wall Street",
        "support labor safety rules",
        "oppose corporate deregulation",
        "expand federal oversight",
        "enforce antitrust laws",
        "protect the public through regulation"
    ],
    "oppose": [
        "cut red tape",
        "support deregulation",
        "reduce government overreach",
        "eliminate burdensome regulations",
        "regulations hurt small businesses",
        "oppose federal interference in business",
        "streamline regulatory processes",
        "government regulations stifle growth",
        "roll back unnecessary rules",
        "free the economy from regulation"
    ]
}

issue_stance_phrases["Trade Barriers"] = {
    "support": [
        "protect domestic industries from foreign competition",
        "impose trade restrictions",
        "limit foreign imports",
        "enforce trade barriers to protect American jobs",
        "shield U.S. businesses from unfair trade practices",
        "protect national industries from globalization",
        "support economic nationalism",
        "enforce quotas on foreign goods",
        "support restrictions on foreign competition",
        "use trade barriers to boost domestic production"
    ],
    "oppose": [
        "support free trade",
        "oppose trade barriers",
        "reduce obstacles to global trade",
        "negotiate international trade agreements",
        "ease restrictions on imports",
        "expand global commerce",
        "oppose economic protectionism",
        "increase trade cooperation",
        "promote trade liberalization",
        "eliminate unnecessary trade regulations"
    ]
}

issue_stance_phrases["Tariffs"] = {
    "support": [
        "impose tariffs on foreign goods",
        "use tariffs to protect American jobs",
        "support reciprocal tariffs",
        "penalize unfair foreign trade practices",
        "defend American manufacturing with tariffs",
        "enforce tariffs on countries that cheat",
        "support import taxes to level the playing field",
        "use tariffs to promote domestic production",
        "back tariffs to reduce trade deficits",
        "tariffs ensure fair competition"
    ],
    "oppose": [
        "oppose tariffs on consumer goods",
        "tariffs raise prices for Americans",
        "oppose trade wars",
        "eliminate tariffs to support global trade",
        "tariffs hurt small businesses",
        "end harmful tariff policies",
        "reduce tariffs to benefit consumers",
        "tariffs disrupt supply chains",
        "oppose protectionist tariff policies",
        "support tariff-free trade agreements"
    ]
}

issue_stance_phrases["Balancing the Budget"] = {
    "support": [
        "balance the federal budget",
        "reduce the national deficit",
        "cut government spending",
        "prioritize fiscal responsibility",
        "eliminate wasteful spending",
        "support the Department of Government Efficiency",
        "cut unnecessary programs",
        "lower federal debt",
        "rein in government overreach",
        "restore fiscal discipline"
    ],
    "oppose": [
        "oppose budget cuts",
        "support deficit spending to fund programs",
        "oppose austerity measures",
        "resist cuts to social safety nets",
        "oppose the Department of Government Efficiency",
        "reject across-the-board spending cuts",
        "focus on investment over deficit reduction",
        "oppose slashing public programs",
        "question balancing the budget during economic downturns",
        "support strategic deficit spending"
    ]
}

issue_stance_phrases["Social Security Reform"] = {
    "support": [
        "reform Social Security to prevent insolvency",
        "crack down on Social Security fraud",
        "modernize the Social Security system",
        "cut waste in Social Security",
        "ensure long-term sustainability of Social Security",
        "raise the retirement age",
        "reduce future benefits for high earners",
        "fix Social Security before it goes bankrupt",
        "support means-testing for Social Security",
        "eliminate abuse in entitlement programs"
    ],
    "oppose": [
        "protect Social Security for seniors",
        "oppose cuts to Social Security",
        "defend retirement benefits",
        "honor the promise to retirees",
        "oppose raising the retirement age",
        "Social Security is not an entitlement, it's earned",
        "resist changes that reduce benefits",
        "support expanding Social Security benefits",
        "oppose privatization of Social Security",
        "stand up for senior citizens"
    ]
}

issue_stance_phrases["Subsidized Housing"] = {
    "support": [
        "expand access to affordable housing",
        "increase funding for public housing",
        "support housing assistance programs",
        "invest in low-income housing",
        "fight housing insecurity",
        "build more government-subsidized housing",
        "support rental subsidies",
        "ensure housing as a human right",
        "protect housing vouchers",
        "combat homelessness with housing programs"
    ],
    "oppose": [
        "oppose government-subsidized housing",
        "cut funding for public housing",
        "limit housing assistance programs",
        "oppose rent subsidies",
        "encourage private sector housing solutions",
        "reduce dependency on government housing",
        "stop wasteful housing projects",
        "oppose expanding HUD programs",
        "subsidized housing is inefficient",
        "support free-market housing initiatives"
    ]
}

issue_stance_phrases["Public Healthcare"] = {
    "support": [
        "support publicly funded healthcare",
        "expand government-run healthcare",
        "establish a public health insurance option",
        "healthcare is a human right",
        "support single-payer healthcare",
        "Medicare for All",
        "universal healthcare coverage",
        "government should provide healthcare",
        "strengthen public healthcare systems",
        "guarantee access to healthcare for all"
    ],
    "oppose": [
        "oppose government-run healthcare",
        "public healthcare leads to rationing",
        "against single-payer systems",
        "oppose Medicare for All",
        "government shouldn't run healthcare",
        "public healthcare is inefficient",
        "support private sector alternatives",
        "public healthcare reduces quality",
        "oppose government takeover of healthcare",
        "reject socialized medicine"
    ]
}

issue_stance_phrases["Private Healthcare"] = {
    "support": [
        "protect private health insurance",
        "support private healthcare options",
        "preserve employer-based coverage",
        "allow Americans to keep their insurance",
        "encourage competition in the healthcare market",
        "oppose government takeover of healthcare",
        "healthcare choice is essential",
        "support patient choice in healthcare",
        "oppose eliminating private insurance",
        "expand private sector solutions in healthcare"
    ],
    "oppose": [
        "phase out private insurance",
        "oppose private health insurance companies",
        "end for-profit healthcare",
        "replace private insurance with public options",
        "limit private influence in healthcare",
        "oppose corporate control of healthcare",
        "criticize private insurers for denying care",
        "reduce the role of private insurers",
        "support public alternatives to private insurance",
        "oppose profit-driven healthcare"
    ]
}

issue_stance_phrases["Medicare Expansion"] = {
    "support": [
        "expand Medicare coverage",
        "lower the Medicare eligibility age",
        "add dental and vision to Medicare",
        "support Medicare for more Americans",
        "enroll more people in Medicare",
        "improve Medicare benefits",
        "Medicare for 55 and up",
        "strengthen Medicare for the future",
        "make Medicare more comprehensive",
        "allow early retirement with Medicare access"
    ],
    "oppose": [
        "oppose expanding Medicare",
        "Medicare expansion is too costly",
        "keep Medicare eligibility age as-is",
        "restrict Medicare to seniors only",
        "oppose adding benefits to Medicare",
        "preserve Medicare’s current structure",
        "Medicare expansion risks sustainability",
        "oppose Medicare for younger Americans",
        "don't burden Medicare with more recipients",
        "stop government overreach in Medicare"
    ]
}

issue_stance_phrases["Limits on Prescription Drug Prices"] = {
    "support": [
        "cap insulin prices",
        "limit the cost of prescription drugs",
        "allow Medicare to negotiate drug prices",
        "lower the cost of life-saving medication",
        "end pharmaceutical price gouging",
        "regulate prescription drug costs",
        "impose price controls on essential medicines",
        "stop drug companies from charging excessive prices",
        "make medications affordable for all",
        "support prescription drug reform"
    ],
    "oppose": [
        "oppose government price controls on medicine",
        "restricting drug prices stifles innovation",
        "government should not interfere with pharmaceutical pricing",
        "price caps could limit drug availability",
        "oppose capping insulin prices",
        "protect pharmaceutical innovation",
        "free market should determine drug prices",
        "oppose government negotiation on drug prices",
        "price regulation discourages research and development",
        "let competition lower drug costs"
    ]
}

issue_stance_phrases["Student Loan Forgiveness"] = {
    "support": [
        "cancel student debt",
        "forgive student loans",
        "support loan forgiveness programs",
        "relieve the burden of college debt",
        "wipe out federal student loans",
        "support debt relief for students",
        "make college affordable through forgiveness",
        "help borrowers recover from student loans",
        "support public service loan forgiveness",
        "cancel interest on student loans"
    ],
    "oppose": [
        "oppose student loan forgiveness",
        "student debt cancellation is unfair",
        "forgiveness rewards irresponsible borrowing",
        "taxpayers shouldn't pay for student loans",
        "oppose canceling student debt",
        "forgiving loans increases inflation",
        "support paying your own way through college",
        "loan forgiveness punishes those who paid theirs off",
        "oppose bailout for college grads",
        "focus on reducing tuition instead of forgiveness"
    ]
}

issue_stance_phrases["Public School Funding"] = {
    "support": [
        "increase funding for public schools",
        "invest in public education",
        "raise teacher salaries",
        "support better school infrastructure",
        "fully fund public education",
        "improve public school resources",
        "support public school teachers",
        "increase education budgets",
        "oppose budget cuts to public schools",
        "modernize public school facilities"
    ],
    "oppose": [
        "oppose increased public school spending",
        "cut funding for public education",
        "reduce education budgets",
        "oppose teacher pay raises",
        "public schools waste money",
        "support shifting funds away from public schools",
        "oppose federal funding for schools",
        "reform failing public schools before investing more",
        "focus on school choice instead of public schools",
        "public schools are inefficient"
    ]
}

issue_stance_phrases["School Choice"] = {
    "support": [
        "support school choice",
        "fund students, not systems",
        "expand access to charter schools",
        "support private school vouchers",
        "parents should choose where their kids go to school",
        "increase education savings accounts",
        "empower families through school choice",
        "support education freedom",
        "let funding follow the student",
        "support alternatives to public schools"
    ],
    "oppose": [
        "oppose school vouchers",
        "keep public funds in public schools",
        "oppose charter school expansion",
        "school choice undermines public education",
        "oppose defunding public schools for private options",
        "oppose for-profit schools",
        "vouchers hurt disadvantaged students",
        "oppose privatization of education",
        "school choice increases inequality",
        "protect public education from diversion of funds"
    ]
}

issue_stance_phrases["Parental Rights"] = {
    "support": [
        "support parents' right to know what's taught in schools",
        "oppose secret gender transitions without parental consent",
        "give parents control over their children's education",
        "defend parental authority in schools",
        "oppose indoctrination in the classroom",
        "support curriculum transparency laws",
        "parents should decide what's appropriate for their kids",
        "empower parents in school decision-making",
        "oppose political agendas in schools",
        "protect children from inappropriate content"
    ],
    "oppose": [
        "oppose book bans in schools",
        "support inclusive education for all students",
        "oppose censorship of classroom discussions",
        "reject anti-LGBTQ school policies",
        "oppose limiting teachers' speech",
        "defend academic freedom",
        "students' rights matter too",
        "oppose parental overreach into school policy",
        "oppose removing diverse perspectives from curriculum",
        "stand against discriminatory education laws"
    ]
}

issue_stance_phrases["Affirmative Action"] = {
    "support": [
        "support affirmative action in college admissions",
        "consider race in admissions decisions",
        "affirmative action promotes campus diversity",
        "defend race-conscious admissions policies",
        "college should reflect our nation's diversity",
        "close racial gaps in higher education",
        "support equitable access to elite institutions",
        "affirmative action helps underrepresented students",
        "oppose race-blind admissions policies",
        "preserve diversity in college classrooms"
    ],
    "oppose": [
        "oppose affirmative action in college admissions",
        "admissions should be race-neutral",
        "college admissions should be based on merit",
        "affirmative action is unfair to high-achieving students",
        "oppose race-based admissions policies",
        "support colorblind admissions",
        "affirmative action discriminates against Asian students",
        "oppose identity-based preferences in admissions",
        "support race-neutral admissions processes",
        "equal opportunity, not race quotas"
    ]
}

issue_stance_phrases["Renewable Energy"] = {
    "support": [
        "invest in wind and solar energy",
        "transition to clean energy",
        "support renewable energy development",
        "wind and solar are the future",
        "combat climate change with renewables",
        "reduce reliance on fossil fuels",
        "support a green energy economy",
        "renewable energy creates jobs",
        "decarbonize the power grid",
        "make America a leader in clean energy"
    ],
    "oppose": [
        "oppose subsidies for wind and solar",
        "renewables are unreliable",
        "wind turbines destroy landscapes",
        "solar panels are too expensive",
        "stop the war on fossil fuels",
        "renewable energy hurts the economy",
        "solar and wind can't power America",
        "oppose mandates for green energy",
        "wind and solar are inefficient",
        "renewables increase energy costs"
    ]
}

issue_stance_phrases["Nuclear Energy"] = {
    "support": [
        "support nuclear energy",
        "invest in nuclear power",
        "expand nuclear energy as clean power",
        "nuclear is key to energy independence",
        "include nuclear in climate strategy",
        "modernize nuclear infrastructure",
        "nuclear energy is zero-emission",
        "develop advanced nuclear reactors",
        "support small modular reactors",
        "nuclear is reliable baseload energy"
    ],
    "oppose": [
        "oppose nuclear power",
        "nuclear energy is too dangerous",
        "oppose building new nuclear plants",
        "nuclear waste is a threat",
        "nuclear accidents risk public safety",
        "oppose government subsidies for nuclear",
        "invest in safer alternatives instead of nuclear",
        "shutdown aging nuclear plants",
        "oppose expansion of nuclear infrastructure",
        "nuclear power is not sustainable"
    ]
}

issue_stance_phrases["Carbon Emissions Controls"] = {
    "support": [
        "implement carbon emissions standards",
        "reduce greenhouse gas emissions",
        "support carbon pricing or taxation",
        "enforce limits on carbon output",
        "support cap-and-trade systems",
        "transition to a low-carbon economy",
        "set net-zero carbon targets",
        "support decarbonization policies",
        "mandate carbon reduction in industry",
        "reduce CO2 emissions from power plants"
    ],
    "oppose": [
        "oppose carbon taxes",
        "oppose emissions caps",
        "carbon regulations hurt the economy",
        "stop overregulating carbon output",
        "oppose cap-and-trade legislation",
        "carbon limits harm American businesses",
        "reject net-zero mandates",
        "oppose carbon reduction targets",
        "too much regulation on carbon emissions",
        "carbon restrictions cost jobs"
    ]
}

issue_stance_phrases["Pollutant Controls"] = {
    "support": [
        "strengthen environmental protection laws",
        "reduce air and water pollution",
        "hold polluters accountable",
        "enforce clean water standards",
        "regulate industrial waste disposal",
        "limit toxic chemical dumping",
        "oppose corporate polluters",
        "support clean air initiatives",
        "protect communities from environmental hazards",
        "oppose weakening of EPA rules"
    ],
    "oppose": [
        "oppose burdensome pollution regulations",
        "environmental regulations hurt business",
        "EPA overreach harms the economy",
        "cut red tape on pollution rules",
        "oppose stricter pollution controls",
        "relax air and water quality standards",
        "reduce environmental compliance costs",
        "pollution regulations go too far",
        "oppose anti-industry environmental laws",
        "stop excessive environmental oversight"
    ]
}

issue_stance_phrases["Background Checks"] = {
    "support": [
        "expand background checks for gun purchases",
        "require background checks at gun shows",
        "close the background check loophole",
        "universal background checks",
        "support common-sense gun laws",
        "strengthen background check systems",
        "mandate background checks for all firearm sales",
        "background checks save lives",
        "ensure guns don’t fall into the wrong hands",
        "support bipartisan background check legislation"
    ],
    "oppose": [
        "oppose universal background checks",
        "background checks infringe on Second Amendment rights",
        "background checks won't stop criminals",
        "oppose expanding gun control laws",
        "protect law-abiding gun owners",
        "background checks are government overreach",
        "oppose registration disguised as background checks",
        "second amendment is non-negotiable",
        "oppose more red tape for gun ownership",
        "reject background check mandates"
    ]
}

issue_stance_phrases["Assault Weapons Ban"] = {
    "support": [
        "ban assault weapons",
        "reinstate the federal assault weapons ban",
        "oppose weapons of war on our streets",
        "support banning AR-15s",
        "limit access to high-capacity rifles",
        "protect communities from mass shootings",
        "support common-sense gun reform",
        "keep military-style weapons off the streets",
        "support legislation to ban assault weapons",
        "end civilian access to combat-style firearms"
    ],
    "oppose": [
        "oppose assault weapons bans",
        "defend the right to own AR-15s",
        "bans violate the Second Amendment",
        "there is no such thing as an assault weapon",
        "assault weapon bans don't stop crime",
        "oppose banning lawfully owned firearms",
        "bans target responsible gun owners",
        "protect gun rights against unconstitutional laws",
        "oppose feel-good gun legislation",
        "AR-15s are commonly owned firearms"
    ]
}

issue_stance_phrases["Gun Ownership"] = {
    "support": [
        "support the Second Amendment",
        "defend the right to bear arms",
        "protect law-abiding gun owners",
        "oppose gun confiscation",
        "support responsible gun ownership",
        "guns are essential for self-defense",
        "oppose restrictions on gun ownership",
        "uphold constitutional gun rights",
        "gun ownership is a fundamental liberty",
        "support concealed carry rights"
    ],
    "oppose": [
        "guns don't belong in civilian hands",
        "oppose private gun ownership",
        "ban all firearms",
        "no one should own a gun",
        "confiscate all guns from civilians",
        "disarm the population",
        "repeal the Second Amendment",
        "guns should only be for law enforcement",
        "eliminate civilian gun access",
        "oppose individual gun rights"
    ]
}

issue_stance_phrases["Automatic Weapons Ban"] = {
    "support": [
        "maintain the automatic weapons ban",
        "support restrictions on fully automatic firearms",
        "oppose civilian access to machine guns",
        "keep automatic weapons off the streets",
        "protect the public from fully automatic guns",
        "support the 1970s automatic weapons ban",
        "uphold federal automatic firearm regulations",
        "automatic weapons belong only in military hands",
        "support limits on rapid-fire weapons",
        "oppose loosening restrictions on machine guns"
    ],
    "oppose": [
        "repeal the automatic weapons ban",
        "support full Second Amendment rights including automatic weapons",
        "oppose restrictions on machine guns",
        "automatic weapons should be legal",
        "defend the right to own fully automatic firearms",
        "the ban on automatic weapons is unconstitutional",
        "restore access to all firearm types",
        "automatic gun bans go too far",
        "oppose outdated federal weapons bans",
        "support private ownership of machine guns"
    ]
}

issue_stance_phrases["Ammunition Restrictions"] = {
    "support": [
        "ban high-capacity magazines",
        "limit magazine size to 10 rounds",
        "restrict access to armor-piercing ammunition",
        "ban dangerous ammo types",
        "support common-sense ammo regulations",
        "oppose sale of military-grade ammunition",
        "limit civilian access to certain bullet types",
        "support magazine capacity limits",
        "regulate high-powered ammunition",
        "ban hollow-point rounds for civilians"
    ],
    "oppose": [
        "oppose magazine size limits",
        "defend access to all legal ammunition",
        "high-capacity magazines are essential for self-defense",
        "oppose bans on hollow-point ammo",
        "ammo restrictions violate Second Amendment rights",
        "magazine limits put lives at risk",
        "oppose overregulation of ammunition",
        "support access to standard-capacity magazines",
        "oppose banning types of bullets",
        "restricting ammo types is government overreach"
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

def precompute_phrase_vectors(issue_dict, nlp):
    phrase_vectors = []
    for issue, stance_map in issue_dict.items():
        for stance, phrases in stance_map.items():
            for phrase in phrases:
                vector = nlp(phrase).vector
                phrase_vectors.append({
                    "issue": issue,
                    "stance": stance,
                    "phrase": phrase,
                    "vector": vector
                })
    return phrase_vectors

def detect_issue(text, trigger_phrases_dict, cached_vectors, nlp, similarity_threshold=0.87, min_gap=0.03):
    exact = detect_issue_exact_with_conflict(text, trigger_phrases_dict, nlp)

    if exact is None:
        # No exact match → semantic fallback
        return detect_issue_semantic(text, cached_vectors, nlp, similarity_threshold, min_gap)

    elif "conflict" in exact:
        # Multiple exact matches → discard or log
        print(f"Ambiguous exact match: {exact['conflict']}")
        return None

    else:
        return exact  # single, clean exact match

def detect_issue_exact_with_conflict(text, trigger_phrases_dict, nlp):
    doc = nlp(text)
    matched_issues = []

    for issue, phrases in trigger_phrases_dict.items():
        for phrase in phrases:
            phrase_lower = phrase.lower()
            if any(token.text.lower() == phrase_lower for token in doc):
                matched_issues.append(issue)
                break

    if len(matched_issues) == 1:
        return {"issue": matched_issues[0], "confidence": 1.0, "method": "exact"}
    elif len(matched_issues) > 1:
        return {"conflict": matched_issues}
    else:
        return None
    
def detect_issue_semantic(text, cached_issue_vectors, nlp, threshold=0.87, min_gap=0.03):
    doc_vector = nlp(text).vector

    def cosine_sim(vec1, vec2):
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2) + 1e-8)

    results = []
    for entry in cached_issue_vectors:
        score = cosine_sim(doc_vector, entry["vector"])
        if score >= threshold:
            results.append((score, entry["issue"]))

    if not results:
        return None

    results.sort(reverse=True)

    # Ambiguity check
    if len(results) > 1 and results[0][0] - results[1][0] < min_gap:
        return None  # Discard ambiguous match

    return {
        "issue": results[0][1],
        "confidence": results[0][0],
        "method": "semantic"
    }

def detect_stance_for_issue(text, issue, issue_stance_phrases, cached_vectors, nlp, threshold=0.5):
    doc_vector = nlp(text).vector
    best_match = None
    best_score = -1

    def cosine_sim(vec1, vec2):
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2) + 1e-8)

    for entry in cached_vectors:
        if entry["issue"] != issue:
            continue  # Skip other issues

        score = cosine_sim(doc_vector, entry["vector"])
        if score > best_score:
            best_score = score
            best_match = {
                "stance": entry["stance"],
                "matched_phrase": entry["phrase"],
                "confidence": score
            }

    if best_score >= threshold:
        return best_match
    else:
        return None


def handle_text(text):
    doc = nlp(text)
    for sent in doc.sents:
        if len(sent) < 6: continue
        sentence = sent.text
        
        issue_result = detect_issue(sentence, issue_trigger_phrases, cached_issue_vectors, nlp)

        if issue_result:
            print(sentence)
            print(issue_result)
            issue = issue_result["issue"]
            stance_result = detect_stance_for_issue(
                sentence, issue, issue_stance_phrases, cached_stance_vectors, nlp
            )
                      
            if stance_result:
                policy_counts[issue][stance_result["stance"]] += stance_result["confidence"]
                print(stance_result)

# Main
print("Beginning NLP")
nlp = spacy.load("en_core_web_lg")
phrase = nlp(text="hi")

# Cache vectors (just has to be done once. Takes about 4s)
print("Caching Vectors")
cached_stance_vectors = precompute_phrase_vectors(issue_stance_phrases, nlp)
cached_issue_vectors = precompute_issue_vectors(issue_trigger_phrases, nlp)

policy_counts = defaultdict(lambda: {"support": 0.0, "oppose": 0.0})
candidate = "Tammy Baldwin"
text = db_handling.get_scraped_file_from_database("TammyBaldwin/tammy_baldwin_wi_senate.txt")
# handle_file("TammyBaldwin/tammy_baldwin_wi_senate.txt")
# handle_file("TammyBaldwin/tammy_baldwin_campaign_site.txt")
# handle_file("TammyBaldwin/SenatorBaldwin.txt")

print("Handling Text")
handle_text(text)

# Determine Position based on counts
#file = open(candidate[0].lower() + "_" + candidate[1].lower() + "_positions.txt", "w")
print("Done")
for policy, counts in policy_counts.items():
    print(f"Policy: {policy}")
    print(f"  SUPPORT: {counts['support']}")
    print(f"  OPPOSE: {counts['oppose']}")
    print()

    # if counts["SUPPORT"] > counts["OPPOSE"]:
    #     file.write("Supports " + policy + "\n")
    #     #db_handling.push_position_to_database(candidate[0], candidate[1], policy, "Supports")
    # elif counts["SUPPORT"] < counts["OPPOSE"]:
    #     file.write("Opposes " + policy + "\n")
    #     #db_handling.push_position_to_database(candidate[0], candidate[1], policy, "Opposes")
    