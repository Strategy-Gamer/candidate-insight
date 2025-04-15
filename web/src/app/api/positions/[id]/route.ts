import pool from '../../../../utils/dbconnect';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

  const db = await pool.connect();
  try {

    const { id } = await params;

    const result = await db.query(
      `SELECT * FROM
       Position_Sources JOIN Sources
       ON Position_sources.source_id = Sources.source_id
       WHERE position_id = $1`, [id]  
    )
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Position sources not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({sources: result.rows});
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