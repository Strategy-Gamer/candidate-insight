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
        category: "Economy",
        category_description: "Economy Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur aliquet quam id dui posuere blandit. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Proin eget tortor risus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Pellentesque in ipsum id orci porta dapibus. Nulla porttitor accumsan tincidunt.",
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
        category_description: "Healthcare Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur aliquet quam id dui posuere blandit. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Proin eget tortor risus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Pellentesque in ipsum id orci porta dapibus. Nulla porttitor accumsan tincidunt.",
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
        category_description: "Education Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur aliquet quam id dui posuere blandit. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Proin eget tortor risus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Pellentesque in ipsum id orci porta dapibus. Nulla porttitor accumsan tincidunt.",
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
        category_description: "Evironment Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur aliquet quam id dui posuere blandit. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Proin eget tortor risus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Pellentesque in ipsum id orci porta dapibus. Nulla porttitor accumsan tincidunt.",
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
        category_description: "Gun Control Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur aliquet quam id dui posuere blandit. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Proin eget tortor risus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Pellentesque in ipsum id orci porta dapibus. Nulla porttitor accumsan tincidunt.",
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
        const query = 'INSERT INTO Political_Issue (issue_name, category_id, issue_description) VALUES ($1, $2, $3) RETURNING issue_name';
        const result = await db.query(query, [issue.issue_name, category, issue.issue_description]);
        const issueID = result.rows[0].issue_name;
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
  // Gay Valimont FL House
  try {
    const query = 'INSERT INTO candidate (first_name, last_name, state, gender, party_affiliation, profile_image_url, dob, website_url, twitter) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING candidate_id';
    for (let i=0; i < numCandidates*2; i+=2) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [firstName, lastName, state, position, gender, party, image_url, dob] = lines[i].trim().split(' ');
        const webURL = lines[i+1].trim();

        const result = await db.query(query, [firstName, lastName, state, gender, party, image_url, dob, webURL, '@twitter']);
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

  const incumbentPositions = ["Governor", "Mayor", "City Council", "Representative", "Senator", "President"];
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
        const runningFor = runningForPositions[Math.floor(Math.random() * runningForPositions.length)];
        const incumbentPosition = incumbentPositions[Math.floor(Math.random() * incumbentPositions.length)];
        const congressionalDistrict = runningFor === "Representative" ? getDistrictCode(stateCodes[Math.floor(Math.random() * stateCodes.length)]) : null;
        const description = `${runningFor} candidate for the ${electionYear} election. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;
        
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

async function insertPositions(issues, candidates) {
  const db = await pool.connect();

  try {
    const positionQuery = 'INSERT INTO Candidate_Position (candidate_id, issue_id, position_description) VALUES ($1, $2, $3) RETURNING position_id';
    const sourceQuery = 'INSERT INTO Sources (bias, url, date) VALUES ($1, $2, $3) RETURNING source_id';
    const positionSourceQuery = 'INSERT INTO Position_Sources (position_id, source_id) VALUES ($1, $2)';

    const positionPromises = [];
    for (const issueId of issues) {
      for (const candidateId of candidates) {
        const str = Math.random() < 0.5 ? "SUPPORTS" : "OPPOSES"
        positionPromises.push(db.query(positionQuery , [candidateId, issueId, `${str} ${issueId} Lorem ipsum dolor sit amet, consectetur adipiscing elit.`]));
      }
    }

    const positionResults = await Promise.all(positionPromises);
    const positionIds = positionResults.map(res => res.rows[0].position_id);

    console.log("Inserting sources for positions...");
    const sourcePromises = [];
    for (let i=0; i < positionIds.length; i++) {
      let bias1 = Math.random()*4 - 2;
      let bias2 = Math.random()*4 - 2;
      sourcePromises.push(db.query(sourceQuery, [bias1, "www.google.com", generateDate()]));
      sourcePromises.push(db.query(sourceQuery, [bias2, "https://github.com/Strategy-Gamer/candidate-insight", generateDate()]));
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

  if (refresh) {
    console.log("Refreshing tables...");
    await pool.query('DELETE FROM Candidate_Position; DELETE FROM Position_Sources; DELETE FROM Sources; DELETE FROM Candidate_Meta; DELETE FROM Political_Issue; DELETE FROM Political_Category; DELETE FROM Candidate;');
  }

  if (numCandidates < 1 || numCandidates > 988) {
    console.log("Invalid number of candidates");
    process.exit(1);
  }
  
  console.log("Inserting policies...");
  const [issueIDs, candidateIDs] = await Promise.all([insertPolicies(), insertCandidates(numCandidates)]);
  console.log("Inserting candidate meta...");
  await insertMeta(candidateIDs);
  console.log("Inserting positions...");
  await insertPositions(issueIDs, candidateIDs);
}

main();