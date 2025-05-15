import fs from 'fs';
import pg from 'pg';
import env from "dotenv";

env.config({ path: '../.env' });

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const data = JSON.parse(fs.readFileSync('../../nlp/tim_burchett.json', 'utf-8'));

const candidate_id = 19; // Assuming candidate_id is known and fixed for this example

async function insertData() {
    console.log(candidate_id);
    const client = await pool.connect();
    try {
        for (const position of data.positions) {
            await client.query('BEGIN');
            
            // Get issue_id
            const issueRes = await client.query(
                `SELECT issue_id FROM Political_Issue WHERE issue_name = $1`,
                [position.issue]
            );

            if (issueRes.rows.length === 0) {
                console.error(`Issue not found: ${position.issue}`);
                await client.query('ROLLBACK');
                continue;
            }
            const issueId = issueRes.rows[0].issue_id;

            // Insert into Candidate_Position (or get if already exists)
            const posRes = await client.query(
                `INSERT INTO Candidate_Position (candidate_id, issue_id, supports_position, position_description)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (candidate_id, issue_id) DO UPDATE SET
                    supports_position = EXCLUDED.supports_position,
                    position_description = EXCLUDED.position_description
                 RETURNING position_id`,
                [candidate_id, issueId, position.stance, position.desc]
            );
            const positionId = posRes.rows[0].position_id;

            // Handle sources
            for (const src of position.sources) {
                // Check for existing source
                const existingSourceRes = await client.query(
                    `SELECT source_id FROM Sources WHERE tweet = $1 OR url = $2`,
                    [src.tweet, src.url]
                );

                let sourceId;
                if (existingSourceRes.rows.length > 0) {
                    sourceId = existingSourceRes.rows[0].source_id;
                } else {
                    let dateObj = null;
                    if (!isNaN(Date.parse(src.date))) {
                        dateObj = new Date(src.date);
                        // safe to use dateObj
                    }

                    const srcRes = await client.query(
                        `INSERT INTO Sources (source_type, tweet, url, date, scraped_on)
                         VALUES ($1, $2, $3, $4, $5)
                         RETURNING source_id`,
                        [
                            src.type,
                            src.tweet,
                            src.url,
                            dateObj,
                            new Date(src.scraped_on)
                        ]
                    );
                    sourceId = srcRes.rows[0].source_id;
                }

                // Link source to position
                await client.query(
                    `INSERT INTO Position_Sources (position_id, source_id)
                     VALUES ($1, $2)
                     ON CONFLICT DO NOTHING`,
                    [positionId, sourceId]
                );
            }

            await client.query('COMMIT');
        }

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error during insertion:", err.message);
    } finally {
        client.release();
    }
}

insertData().then(() => console.log("Insertion complete.")).catch(err => console.error("Fatal error:", err.message));