import fs from 'fs';
import pg from 'pg';
import env from "dotenv";

env.config({path: '../.env.prodreal'});

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
    category_description: "Policies regarding the United States' interactions and relationships with other nations.",
    icon: "foreign_policy.png",
    issues: [
      { issue_name: "Ukraine War", issue_description: "Policies and positions related to the conflict in Ukraine." },
      { issue_name: "Israel-Gaza War", issue_description: "Positions on the ongoing conflict between Israel and Gaza." },
      { issue_name: "China", issue_description: "Approaches to economic and military relations with China." },
      { issue_name: "Military Spending", issue_description: "Debates over defense budget and military investments." }
    ]
  },
  {
    category: "Social Issues",
    category_description: "Topics that relate to cultural, moral, and societal norms in the United States.",
    icon: "social_issues.png",
    issues: [
      { issue_name: "Abortion", issue_description: "Views on access to and regulation of abortion services." },
      { issue_name: "Transgender Rights", issue_description: "Positions on rights and protections for transgender individuals." },
      { issue_name: "Election Integrity", issue_description: "Beliefs about the security and reliability of elections." },
      { issue_name: "Diversity, Equity, Inclusion", issue_description: "Support for or opposition to institutional DEI initiatives." }
    ]
  },
  {
    category: "Immigration",
    category_description: "Policies surrounding the entry and status of immigrants and border control.",
    icon: "immigration.png",
    issues: [
      { issue_name: "Border Patrol", issue_description: "Funding and role of border enforcement agencies." },
      { issue_name: "Border Wall", issue_description: "Support for physical barriers along the U.S. border." },
      { issue_name: "Decreasing Immigration", issue_description: "Policies aimed at reducing legal immigration numbers." },
      { issue_name: "Illegal/Undocumented Migrants", issue_description: "Positions on how to handle individuals residing in the U.S. unlawfully." }
    ]
  },
  {
    category: "Economy",
    category_description: "Economic strategies including taxation, trade, and fiscal policy.",
    icon: "economy.png",
    issues: [
      { issue_name: "Progressive Taxation", issue_description: "Support for tax brackets that increase with income." },
      { issue_name: "Regulations", issue_description: "Approach to government regulations on businesses and industries." },
      { issue_name: "Tariffs", issue_description: "Use of tariffs to protect or penalize trade." },
      { issue_name: "Balancing the Budget", issue_description: "Views on reducing deficits and managing national debt." }
    ]
  },
  {
    category: "Healthcare",
    category_description: "Policies concerning healthcare systems, access, and insurance.",
    icon: "healthcare.png",
    issues: [
      { issue_name: "Public Healthcare", issue_description: "Support for government-provided health coverage options." },
      { issue_name: "Private Healthcare", issue_description: "Promotion of private health insurance markets." },
      { issue_name: "Medicare Expansion", issue_description: "Proposals to broaden eligibility for Medicare." },
      { issue_name: "Limits on Prescription Drug Prices", issue_description: "Efforts to regulate drug prices and increase affordability." }
    ]
  },
  {
    category: "Education",
    category_description: "Educational priorities including funding, curriculum, and access.",
    icon: "education.png",
    issues: [
      { issue_name: "Student Loan Forgiveness", issue_description: "Support for canceling or reducing student debt." },
      { issue_name: "Public School Funding", issue_description: "Investment in public education systems." },
      { issue_name: "School Choice", issue_description: "Policies enabling students to attend schools outside their assigned zones." },
      { issue_name: "Affirmative Action", issue_description: "Support or opposition to race-conscious admissions policies." }
    ]
  },
  {
    category: "Environment",
    category_description: "Environmental and energy policies related to sustainability and climate change.",
    icon: "environment.png",
    issues: [
      { issue_name: "Renewable Energy", issue_description: "Promotion of solar, wind, and other renewable sources." },
      { issue_name: "Nuclear Energy", issue_description: "Perspectives on the use of nuclear power." },
      { issue_name: "Carbon Emissions Controls", issue_description: "Regulation of carbon output to combat climate change." },
      { issue_name: "Pollutant Controls", issue_description: "Restrictions on pollution to protect ecosystems and public health." }
    ]
  },
  {
    category: "Civil Liberties",
    category_description: "Policies impacting individual freedoms and constitutional rights.",
    icon: "civil_liberties.png",
    issues: [
      { issue_name: "Background Checks", issue_description: "Requirements for screening gun buyers." },
      { issue_name: "Assault Weapons Ban", issue_description: "Restrictions on the sale and ownership of military-style firearms." },
      { issue_name: "Gun Ownership", issue_description: "Views on the Second Amendment and private gun ownership rights." },
      { issue_name: "Ammunition Restrictions", issue_description: "Regulation of the sale and use of ammunition." }
    ]
  }
];


const data = fs.readFileSync('Candidates.txt', 'utf8');
const lines = data.split('\n');

// Useful for missing month, year, or day values in a date string
function isOnlyZeros(str) {
  if (!str.length) return false;
  for (let char of str) {
    if (char !== '0') return false;
  }
  return true;
}

function invalidDate(dateStr) {
  return dateStr.split('-').some(isOnlyZeros);
}

async function insertPolicies() {
  const db = await pool.connect();

  try {
    const query = 'INSERT INTO Political_Category (category, category_description) VALUES ($1, $2)';
    for (const policy of policyData) {
      const category = policy.category;
      await db.query(query, [category, policy.category_description]);
        
      for (const issue of policy.issues) {
        const query = 'INSERT INTO Political_Issue (issue_name, category_id, issue_description) VALUES ($1, $2, $3) RETURNING issue_id';
        await db.query(query, [issue.issue_name, category, issue.issue_description]);
      }
    }
  }
  catch (error) {
    console.log(error);
  }
  finally {
    db.release();
  }
}

async function insertData() {
  const db = await pool.connect();

  try {
    const candidateQuery = 
      `INSERT INTO Candidate (
        first_name, 
        last_name, 
        state,
        gender,
        party_affiliation,
        profile_image_url,
        website_url, 
        twitter,
        dob,
        dob_text
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING candidate_id`;

    const candidateMetaQuery = 
      `INSERT INTO Candidate_Meta (
        election_year,
        candidate_id,
        congressional_district,
        incumbent_position,
        running_for_position,
        election_date,
        term_end_date,
        won_election
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;

      for (let i=0; i < lines.length; i+=2) {
        const [
          firstName, 
          lastName, 
          state,
          gender,
          partyAffiliation,
          imageUrl,
          dob,
          incumbentPos,
          runningForPos,
          electionDate,
          termEndDate,
          congressionalDistrict,
          winner
        ]  = lines[i].trim().split(' ');
        const [webURL, twitter] = lines[i+1].trim().split(' ');

        const isInvalidDate = invalidDate(dob);
        let DOB = isInvalidDate ? null : dob;
        let DOBTEXT = isInvalidDate ? dob : null;

        const result = await db.query(candidateQuery, [
          firstName, 
          lastName, 
          state,
          gender,
          partyAffiliation,
          imageUrl, 
          webURL, 
          twitter,
          DOB,
          DOBTEXT
        ]);

        const candidateID = result.rows[0].candidate_id;
        let term = termEndDate == "NULL" ? null : termEndDate;

        let incumbent = incumbentPos.replace(/_/g, ' ');
        if (incumbent === "NULL") {
          incumbent = null;
        }

        await db.query(candidateMetaQuery, [
          "2024",
          candidateID,
          congressionalDistrict,
          incumbent,
          runningForPos,
          electionDate,
          term,
          winner
        ]);
      }
  }
  catch (err) {
    console.log(err);
  }
  finally {
    db.release();
  }
}

insertData().then(() => insertPolicies()).then(() => {
    console.log('Data inserted');
    process.exit(0);
}).catch((err) => {
    console.log(err);
    process.exit(1);
});