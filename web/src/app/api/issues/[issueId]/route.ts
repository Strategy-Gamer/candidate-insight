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
    const issueData = await db.query(
      `SELECT issue_id FROM Political_Issue WHERE issue_name = $1`,
      [issueId]
    );

    //Makes sure that the data isn't empty.
    if (issueData.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      );
    }

    const issue = issueData.rows[0].issue_id;
    
    const positionData = await db.query(
      `SELECT * FROM Candidate_Position WHERE issue_id = $1`,
      [issue] 
    );
    
    //Makes sure that the data isn't empty.
    if (positionData.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No candidate positions found' },
        { status: 404 }
      );
    }

    const positions = positionData.rows;
    return NextResponse.json(
      { success: true, positions: positions}
    );
  }
  catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
  finally {
    db.release();
  }
}