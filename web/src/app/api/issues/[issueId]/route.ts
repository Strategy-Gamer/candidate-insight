import pool from '../../../../utils/dbconnect';
import { Issue } from '@/types/issues';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { issueId: string } }
) {

  const db = await pool.connect();
  try {

    // Using the issue's id for now.
    const { issueId } = await params;
    
    const issueData = await db.query(
      `SELECT * FROM political_category WHERE category = $1`, [issueId] 
    );
    
    //Makes sure that the data isn't empty.
    if (issueData.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      );
    }

    const issue: Issue = issueData.rows[0];
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