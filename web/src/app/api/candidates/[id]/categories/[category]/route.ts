import pool from '../../../../../../utils/dbconnect';
import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: number; category: string }> }
  ) {
    const db = await pool.connect();
    try {
        
        const { id, category } = await params;

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
          `, [id, category]);
  
      return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching candidate positions:', error);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
    } finally {
      db.release();
    }
  }
