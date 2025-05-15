import pool from '../../../../utils/dbconnect';
// import { Candidate } from '@/types/candidate';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

  const db = await pool.connect();
  try {

    // will need to adjust for metadata (i.e year)
    const { id } = await params;
    
    const candidateQuery = `
      SELECT
        c.*,
        cm.*
      FROM
        candidate c
      JOIN 
        candidate_meta cm ON c.candidate_id = cm.candidate_id
      WHERE
        c.candidate_id = $1
        AND cm.election_year = '2024'
    `;

    const result = await db.query(candidateQuery, [parseInt(id)]);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
  finally {
    db.release();
  }
}