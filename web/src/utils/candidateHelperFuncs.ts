export const partyAbbrevs = {
    "Democrat": "D",
    "Republican": "R",
    "Independent": "I",
} as const;
  
export const getPartyAbbreviation = (party: string): string | undefined => {
    return partyAbbrevs[party as keyof typeof partyAbbrevs];
};

const stateAbbrevs = {
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
  
export const getStateAbbreviation = (state: string): string | undefined => {
    return stateAbbrevs[state as keyof typeof stateAbbrevs];
};
  

export const appendOrdinalToDistrict = (district: string): string | undefined => {
    // find the -, slice after to get the district number
    let index: number = parseInt(district.slice(district.search("-")));
    
    let j: number = index % 10;
    let k: number = index % 100;

    let ordinal: string;

    if (j === 1 && k !== 11) {
        ordinal = "st";
    }
    if (j === 2 && k !== 12) {
        ordinal = "nd";
    }
    if (j === 3 && k !== 13) {
        ordinal = "rd";
    }

    ordinal = "th";
    
    return district.slice(district.search("-")+1) + ordinal; 
}

  