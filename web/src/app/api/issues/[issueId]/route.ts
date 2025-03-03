import pool from '../../../../utils/dbconnect';
import { Issue } from '@/types/issues';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ issueId: string }> }
) {

  const db = await pool.connect();
  try {

    // Using the issue's id for now.
    const { issueId } = await params;
 
    const candidateData = await db.query(
      'SELECT * FROM political_issue WHERE issue_id = $1', [issueId]
    );
    
    //This is the error that I've been encountering. It's probably something to do with the db query, but I'm not sure.
    if (candidateData.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      );
    }

    const issue: Issue = candidateData.rows[0];
    return NextResponse.json(
      { success: true, issue: issue}
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