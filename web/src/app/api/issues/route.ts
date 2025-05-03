import pool from '../../../utils/dbconnect';
import { NextResponse } from 'next/server';

export async function GET() {

  const db = await pool.connect();
  try {
    const issueQuery = `
      SELECT issue_id, issue_name, issue_description, category, category_description FROM political_issue LEFT JOIN political_category 
      ON political_issue.category_id = political_category.category
    `; 
    const { rows } = await db.query(issueQuery);
    return NextResponse.json({ success: true, issues: rows });
  }
  catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
  finally {
    db.release();
  }
}