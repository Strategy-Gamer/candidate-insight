export const partyAbbrevs = {
    "Democrat": "D",
    "Republican": "R",
    "Independent": "I",
} as const;
  
export const getPartyAbbreviation = (party: string): string | undefined => {
    return partyAbbrevs[party as keyof typeof partyAbbrevs];
};

export const stateAbbrevs = {
    "Alabama": "AL",
    "Alaska": "AK",
    "Arizona": "AZ",
    "Arkansas": "AR",
    "California": "CA",
    "Colorado": "CO",
    "Connecticut": "CT",
    "Delaware": "DE",
    "Florida": "FL",
    "Georgia": "GA",
    "Hawaii": "HI",
    "Idaho": "ID",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kansas": "KS",
    "Kentucky": "KY",
    "Louisiana": "LA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "Michigan": "MI",
    "Minnesota": "MN",
    "Mississippi": "MS",
    "Missouri": "MO",
    "Montana": "MT",
    "Nebraska": "NE",
    "Nevada": "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    "Ohio": "OH",
    "Oklahoma": "OK",
    "Oregon": "OR",
    "Pennsylvania": "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    "Tennessee": "TN",
    "Texas": "TX",
    "Utah": "UT",
    "Vermont": "VT",
    "Virginia": "VA",
    "Washington": "WA",
    "West Virginia": "WV",
    "Wisconsin": "WI",
    "Wyoming": "WY"
};

/* the above was stored in the opposite direction, and I didn't feel like changing it
   I still think it's useful to be able to grab either the state name or the abbreviation,
   so I'm keeping it */
const stateNames: Record<string, string> = Object.fromEntries(
    Object.entries(stateAbbrevs).map(([full, abbrev]) => [abbrev, full])
  );
  
  
export const getStateName = (abbrev: string): string | undefined => {
    return stateNames[abbrev.toUpperCase()];
};
  

export const appendOrdinalToDistrict = (district: string): string => {
    // extract district number
    const districtNumber = district.split("-")[1];

    // remove leading 0s
    const index = parseInt(districtNumber, 10);

    // Determine the correct ordinal suffix
    let ordinal: string;
    if (index % 10 === 1 && index % 100 !== 11) {
        ordinal = "st";
    } else if (index % 10 === 2 && index % 100 !== 12) {
        ordinal = "nd";
    } else if (index % 10 === 3 && index % 100 !== 13) {
        ordinal = "rd";
    } else {
        ordinal = "th";
    }

    return `${index}${ordinal}`;
};


export const getParty = (party: string): string | undefined => {
    if (party === "Democrat") {
      return "Democratic Party";    
    } else if (party === "Republican") {
        return "Republican Party";
    } else {
        return "Independent";
    }   
}

export const getPosition = (
    district: string | null | undefined, 
    party: string | null | undefined, 
    state: string | null | undefined
  ): string => {
    const partyAbbrev = party ? getPartyAbbreviation(party) ?? "?" : "?";
    // const stateAbbrev = state ? getStateAbbreviation(state) ?? state : "Unknown State";
  
    if (district) {
      return `Representative (${partyAbbrev}-${state} ${appendOrdinalToDistrict(district)} District)`;
    } else if (state) {
      return `Senator (${partyAbbrev})-${state}`;
    } 
    return "United States President";
  };

  