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


const data = fs.readFileSync('candidates.txt', 'utf8');
const lines = data.split('\n');

// Should be easily modifiable in the future
function extractData(line) {
    let data = line.trim().split(' ');
    
    // If the candidate is the President
    if (data.length == 3) {
        return {
            firstName: data[0],
            lastName: data[1],
            state: 'USA',
            position: 'President'
        }
    }

    // If the candidate has a middle name
    if (data.length == 5) {
        return {
            firstName: data[0] + ' ' + data[1],
            lastName: data[2],
            state: data[3],
            position: data[4]
        };
    }

    return {
      firstName: data[0],
      lastName: data[1],
      state: data[2],
      position: data[3]
    };
}

async function insertData() {
    const db = await pool.connect();
    // Gay Valimont FL House
    try {
        const query = 'INSERT INTO candidate (first_name, last_name, state, congressional_district, website_url) VALUES ($1, $2, $3, $4, $5)';
        for (let i=0; i < lines.length; i+=2) {
            const {firstName, lastName, state, position} = extractData(lines[i]);
            const webURL = lines[i+1];
            await db.query(query, [firstName, lastName, state, position, webURL]);
        }
    }
    catch (err) {
        console.log(err);
    }
    finally {
        db.release();
    }
}

//insertData();

insertData().then(() => {
    console.log('Data inserted');
    process.exit(0);
}).catch((err) => {
    console.log(err);
    process.exit(1);
});