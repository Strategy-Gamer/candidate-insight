import fs from 'fs';
import pg from 'pg';
import env from "dotenv";

env.config({path: '../.env'});

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const policyData = [
    {
        category: "Foreign Policy",
        category_description: "Foreign Policy Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur aliquet quam id dui posuere blandit. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Proin eget tortor risus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Pellentesque in ipsum id orci porta dapibus. Nulla porttitor accumsan tincidunt.",
        icon: "foreign_policy.png",
        issues: [
            {
                issue_name: "Military Spending",
                issue_description: "Debates over defense budget and military investments."
            },
            {
                issue_name: "International Alliances",
                issue_description: "Discussions on NATO, UN, and other global partnerships."
            }
        ]
    },
    {
        category: 'Social Issues',
        category_description: 'Policies related to civil rights, LGBTQ+ rights, and religious freedoms.',
        icon: 'social_issues.png',
        issues: [
            {
                issue_name: 'Civil Rights',
                issue_description: 'Legislation and protections for marginalized groups.'
            },
            {
                issue_name: 'LGBTQ+ Rights',
                issue_description: 'Policies supporting LGBTQ+ equality and protections.'
            },
        ]
    },
    {
        category: 'Immigration',
        category_description: 'Policies on border security and citizenship.',
        icon: 'immigration.png',
        issues: [
            {
                issue_name: 'Border Wall',
                issue_description: 'Debates over building a wall along the US-Mexico border.'
            },
            {
                issue_name: 'Path to Citizenship',
                issue_description: 'Proposals for legalizing undocumented people'
            },
        ]
    },
    {
        category: "Economy",
        category_description: "Issues regarding taxation, employment, and business.",
        icon: "economy.png",
        issues: [
            {
                issue_name: "Minimum Wage",
                issue_description: "Debates over raising or lowering the federal minimum wage."
            },
            {
                issue_name: "Tax Reform",
                issue_description: "Discussions on restructuring tax laws and rates."
            },
            {
                issue_name: "Trade Policies",
                issue_description: "Regulations regarding international trade and tariffs."
            }
        ]
    },
    {
        category: "Healthcare",
        category_description: "Policies related to medical care and insurance.",
        icon: "healthcare.png",
        issues: [
            {
                issue_name: "Medicare Expansion",
                issue_description: "Debates over expanding or reducing Medicare coverage."
            },
            {
                issue_name: "Prescription Drug Prices",
                issue_description: "Policies aimed at controlling medication costs."
            },
            {
                issue_name: "Mental Health Services",
                issue_description: "Efforts to increase access to mental health care."
            }
        ]
    },
    {
        category: "Education",
        category_description: "Funding and reforms for public and private education.",
        icon: "education.png",
        issues: [
            {
                issue_name: "Student Loan Forgiveness",
                issue_description: "Proposals to reduce or eliminate student loan debt."
            },
            {
                issue_name: "Public School Funding",
                issue_description: "Discussions on the allocation of state and federal funds for education."
            },
            {
                issue_name: "Charter Schools",
                issue_description: "Debates on the role and funding of charter schools."
            }
        ]
    },
    {
        category: "Environment",
        category_description: "Policies addressing climate change and sustainability.",
        icon: "environment.png",
        issues: [
            {
                issue_name: "Renewable Energy",
                issue_description: "Investments and regulations for wind, solar, and hydro energy."
            },
            {
                issue_name: "Carbon Emissions",
                issue_description: "Legislation to reduce carbon footprints and pollution."
            },
            {
                issue_name: "Deforestation",
                issue_description: "Efforts to curb illegal logging and protect forests."
            }
        ]
    },
    {
        category: "Gun Control",
        category_description: "Regulations regarding firearm ownership and use.",
        icon: "gun_control.png",
        issues: [
            {
                issue_name: "Background Checks",
                issue_description: "Expanding or restricting background checks for gun purchases."
            },
            {
                issue_name: "Assault Weapons Ban",
                issue_description: "Debates over banning high-capacity firearms."
            },
            {
                issue_name: "Gun Ownership",
                issue_description: "Second Amendment rights and legal challenges."
            }
        ]
    }
];

const tweets = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.",
    "Curabitur aliquet quam id dui posuere blandit.",
    "Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.",
    "Proin eget tortor risus.",
    "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
    "Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula.",
];

function generateDate() {
  let year = Math.floor(Math.random()*50) + 1990;
  let month = Math.floor(Math.random()*12);
  let day = Math.floor(Math.random()*28) + 1;
  
  const specificDate = new Date(year, month, day); 
  const formattedDate = specificDate.toISOString().split('T')[0];
  return formattedDate;
}

async function insertPolicies() {
  const db = await pool.connect();
  const issueIDs = []
  try {
    const query = 'INSERT INTO Political_Category (category, category_description, icon) VALUES ($1, $2, $3)';
    for (const policy of policyData) {
      const category = policy.category;
      await db.query(query, [category, policy.category_description, policy.icon]);
        
      for (const issue of policy.issues) {
        const query = 'INSERT INTO Political_Issue (issue_name, category_id, issue_description) VALUES ($1, $2, $3) RETURNING issue_id';
        const result = await db.query(query, [issue.issue_name, category, issue.issue_description]);
        const issueID = result.rows[0].issue_id;
        issueIDs.push(issueID);
      }
    }

    return issueIDs;
  }
  catch (error) {
    console.log(error);
  }
  finally {
    db.release();
  }
}

async function insertCandidates(numCandidates) {
  const data = fs.readFileSync('FakeCandidates.txt', 'utf8');
  const lines = data.split('\n');
  lines.pop();
  const candidateIDs = [];

  const db = await pool.connect();
  try {
    const query = 'INSERT INTO candidate (first_name, last_name, state, gender, party_affiliation, dob, website_url, twitter) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING candidate_id';
    for (let i=0; i < numCandidates*2; i+=2) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [firstName, lastName, state, position, gender, party, image_url, dob] = lines[i].trim().split(' ');
        const webURL = lines[i+1].trim();

        const result = await db.query(query, [firstName, lastName, state, gender, party, dob, webURL, '@twitter']);
        const candidateID = result.rows[0].candidate_id;
        candidateIDs.push(candidateID);
    }

    return candidateIDs;
  }
  catch (err) {
    console.log(err);
  }
  finally {
    db.release();
  }
}

async function insertMeta(candidates) {
  const db = await pool.connect();
  const electionYears = {
    2022: "2022-11-08",
    2024: "2024-11-05",
    2026: "2026-11-03",
    2028: "2028-11-08",
  };

  const incumbentPositions = ["Governor", "Representative", "Senator", "President"];
  const runningForPositions = ["Representative", "Senator", "President"];
  const stateCodes = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", 
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", 
    "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", 
    "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", 
    "WI", "WY"
  ];

  function getDistrictCode(state) {
    const districtNumber = Math.floor(Math.random() * 50) + 1;
    return `${state}-${districtNumber.toString().padStart(2, '0')}`;
  }

  try {
    const metaPromises = [];
    const query = `
      INSERT INTO Candidate_Meta (
        election_year, candidate_id, congressional_district, 
        incumbent_position, running_for_position, 
        election_date, term_end_date, description
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    for (let i=0; i < candidates.length; i++) {
      for (const year in electionYears) {
        const candidateId = candidates[i];
        const electionYear = year;
        const electionDate = electionYears[year];
        const termEndDate = `${parseInt(year) + 4}-01-03`;
        
        // determine if candidate is incumbent, running, or both
        const isIncumbent = Math.random() > 0.3; // 70% chance of being incumbent
        const isRunning = Math.random() > 0.3; // 70% chance of running
        
        let incumbentPosition = null;
        let runningFor = null;
        
        if (isIncumbent && isRunning) {
          // both incumbent and running (possibly for same or different position)
          incumbentPosition = incumbentPositions[Math.floor(Math.random() * incumbentPositions.length)];
          runningFor = runningForPositions[Math.floor(Math.random() * runningForPositions.length)];
        } else if (isIncumbent) {
          // only incumbent
          incumbentPosition = incumbentPositions[Math.floor(Math.random() * incumbentPositions.length)];
        } else if (isRunning) {
          // only running
          runningFor = runningForPositions[Math.floor(Math.random() * runningForPositions.length)];
        } else {
          // neither
          continue;
        }
        
        // ensure that they have a congressional district if necessary
        let congressionalDistrict = null;
        if ((incumbentPosition === "Representative" || runningFor === "Representative")) {
          const state = stateCodes[Math.floor(Math.random() * stateCodes.length)];
          congressionalDistrict = getDistrictCode(state);
        }
        
        const description = `${runningFor ? runningFor + ' candidate' : ''}${runningFor && incumbentPosition ? ' and ' : ''}${incumbentPosition ? incumbentPosition + ' incumbent' : ''} for the ${electionYear} election.`;

        metaPromises.push(
          db.query(query, [
            electionYear, candidateId, congressionalDistrict, 
            incumbentPosition, runningFor, 
            electionDate, termEndDate, description
          ])
        );
      }
    }

    await Promise.all(metaPromises);
  } catch (error) {
    console.log(error);
  } finally {
    db.release();
  }
}

async function insertPositions(issues, percentage, candidates) {
  const db = await pool.connect();

  try {
    const positionQuery = 'INSERT INTO Candidate_Position (candidate_id, issue_id, supports_position, position_description) VALUES ($1, $2, $3, $4) RETURNING position_id';
    const sourceQuery = 'INSERT INTO Sources (tweet, url, date) VALUES ($1, $2, $3) RETURNING source_id';
    const positionSourceQuery = 'INSERT INTO Position_Sources (position_id, source_id) VALUES ($1, $2)';

    const positionPromises = [];
    
    // each candidate will take a position on 30-70% of issues
    // Sully - this can be changed if you'd like
    for (const candidateId of candidates) {
      const issuesToTakePositionOn = percentage != -1
        ? issues.length*percentage
        : Math.floor(issues.length * (0.3 + Math.random() * 0.4));

      const shuffledIssues = [...issues].sort(() => 0.5 - Math.random());
      const selectedIssues = shuffledIssues.slice(0, issuesToTakePositionOn);
      
      for (const issueId of selectedIssues) {
        const supports = Math.random() < 0.5;
        positionPromises.push(db.query(positionQuery, [
          candidateId, 
          issueId,
          supports, 
          `${issueId} Lorem ipsum dolor sit amet, consectetur adipiscing elit.`
        ]));
      }
    }

    const positionResults = await Promise.all(positionPromises);
    const positionIds = positionResults.map(res => res.rows[0].position_id);

    console.log("Inserting sources for positions...");
    const sourcePromises = [];
    for (let i=0; i < positionIds.length; i++) {
      let tweetIndex = Math.floor(Math.random() * tweets.length);
      sourcePromises.push(db.query(sourceQuery, [null, "www.google.com", generateDate()]));
      sourcePromises.push(db.query(sourceQuery, [tweets[tweetIndex], "https://github.com/Strategy-Gamer/candidate-insight", generateDate()]));
    }

    const sourceResults = await Promise.all(sourcePromises);
    const sourceIds = sourceResults.map(res => res.rows[0].source_id);

    console.log("Inserting position sources...");
    const positionSourcePromises = [];
    let sourceIndex = 0;
    for (const positionId of positionIds) {
      if (sourceIndex + 1 < sourceIds.length) {
        positionSourcePromises.push(db.query(positionSourceQuery, [positionId, sourceIds[sourceIndex]]));
        positionSourcePromises.push(db.query(positionSourceQuery, [positionId, sourceIds[sourceIndex+1]]));
        sourceIndex += 2;
      }
    }
    await Promise.all(positionSourcePromises);

  }
  catch (error) {
    console.log(error);
  }
  finally {
    db.release();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const refresh = args.includes('refresh');
  const numCandidates = parseInt(args[0]) || 988;
  const percentageOfIssues = parseFloat(args[1]) || -1;

  if (refresh) {
    console.log("Refreshing tables...");
    await pool.query('DELETE FROM Candidate_Position; DELETE FROM Position_Sources; DELETE FROM Sources; DELETE FROM Candidate_Meta; DELETE FROM Political_Issue; DELETE FROM Political_Category; DELETE FROM Candidate;');
  }

  if (numCandidates < 1 || numCandidates > 988) {
    console.log("Number of candidates must be between 1 and 988.");
    process.exit(1);
  }

  if ((percentageOfIssues > 1 || percentageOfIssues <= 0) && percentageOfIssues != -1) {
    console.log("Percentage of issues must be between 0 and 1, or -1 for random.");
    process.exit(1);
  }
  
  console.log("Inserting policies...");
  const [issueIDs, candidateIDs] = await Promise.all([insertPolicies(), insertCandidates(numCandidates)]);
  console.log("Inserting candidate meta...");
  await insertMeta(candidateIDs);
  console.log("Inserting positions...");
  await insertPositions(issueIDs, percentageOfIssues, candidateIDs);
}

main().then(() => {
  console.log('Data inserted');
  process.exit(0);
}).catch((err) => {
  console.log(err);
  process.exit(1);
});