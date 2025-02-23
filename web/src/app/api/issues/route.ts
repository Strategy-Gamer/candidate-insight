import pool from '../../../utils/dbconnect';
import { NextResponse } from 'next/server';

export async function GET() {

  const db = await pool.connect();
  try {
    const { rows } = await db.query('SELECT * FROM political_issue');
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