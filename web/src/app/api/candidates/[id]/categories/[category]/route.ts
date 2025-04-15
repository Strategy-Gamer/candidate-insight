import pool from '../../../../../../utils/dbconnect';
import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; category: string }> }
  ) {
    const db = await pool.connect();
    try {
        
        const { id, category } = await params;
        const [firstName, lastName] = id.split('-');

        const candidateRes = await db.query(
            `SELECT c.candidate_id FROM candidate c
             WHERE LOWER(c.first_name) = LOWER($1)
             AND LOWER(c.last_name) = LOWER($2)`,
            [firstName, lastName]
        );

        if (candidateRes.rowCount === 0) {
            return NextResponse.json(
              { error: 'Candidate not found' }, 
              { status: 404 }
            );
        }
      
        const candidateId = candidateRes.rows[0].candidate_id;

        const result = await db.query(`
            SELECT 
              p.supports_position,
              p.position_description,
              pi.issue_name,
              (
                SELECT COALESCE(JSON_AGG(
                  jsonb_build_object(
                    'url', s.url,
                    'tweet', s.tweet,
                    'date', s.date
                  )
                ), '[]')
                FROM position_sources ps
                JOIN sources s ON ps.source_id = s.source_id
                WHERE ps.position_id = p.position_id
              ) AS sources
            FROM candidate_position p
            JOIN political_issue pi ON p.issue_id = pi.issue_id
            JOIN political_category pc ON pi.category_id = pc.category
            WHERE p.candidate_id = $1
              AND pc.category = $2
          `, [candidateId, category]);
  
      return NextResponse.json(result.rows);
    } finally {
      db.release();
    }
  }
