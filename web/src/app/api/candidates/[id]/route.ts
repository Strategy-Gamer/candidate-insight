import pool from '../../../../utils/dbconnect';
import { Candidate } from '@/types/candidate';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

  const db = await pool.connect();
  try {

    // We can use the real id later on, but for now it will be the first+last name
    const { id } = await params;
    const [firstName, lastName] = id.split('-');
 
    const candidateData = await db.query(
      'SELECT * FROM candidate WHERE first_name = $1 AND last_name = $2',
      [firstName, lastName]
    );
    
    if (candidateData.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }

    const candidate: Candidate = candidateData.rows[0];
    return NextResponse.json(
      { success: true, candidate: candidate }
    );
  }
  catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidate' },
      { status: 500 }
    );
  }
  finally {
    db.release();
  }
}