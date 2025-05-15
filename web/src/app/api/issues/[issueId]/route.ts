import pool from '../../../../utils/dbconnect';
//import { Issue } from '@/types/issues';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { issueId: string } }
) {
  const db = await pool.connect();
  try {
    const { issueId } = await params;
    
    // Fetch issue details
    const issueData = await db.query(
      `SELECT issue_id, issue_name, issue_description 
      FROM Political_Issue 
      WHERE issue_name = $1`,
      [issueId]
    );

    // If no issue is found, return an error
    if (issueData.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      );
    }

    const issue = issueData.rows[0].issue_id;

    // Fetch positions along with sources
    const positionData = await db.query(
      `SELECT 
        c.first_name, 
        c.last_name,
        c.twitter,
        c.party_affiliation,
        cp.position_id,  
        cp.supports_position,
        cp.position_description
      FROM Candidate_Position cp
      JOIN Candidate c ON cp.candidate_id = c.candidate_id
      WHERE cp.issue_id = $1;`,
      [issue]
    );

    // If no positions are found, return an error
    if (positionData.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No candidate positions found' },
        { status: 404 }
      );
    }

    console.log(positionData.rows);
    return NextResponse.json({
      success: true,
      positions: positionData.rows,
      issue: issueData.rows[0],
    });

  } 
  catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch issue' },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}