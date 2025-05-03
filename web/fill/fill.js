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

        await db.query(candidateMetaQuery, [
          "2024",
          candidateID,
          congressionalDistrict,
          incumbentPos,
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

insertData().then(() => {
    console.log('Data inserted');
    process.exit(0);
}).catch((err) => {
    console.log(err);
    process.exit(1);
});