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
        c.party_affiliation,
        cp.position_id,  
        cp.supports_position,
        cp.position_description,
        s.source_id,
        s.tweet,
        s.url,
        s.date
      FROM Candidate_Position cp
      JOIN Candidate c ON cp.candidate_id = c.candidate_id
      LEFT JOIN Position_Sources ps ON cp.position_id = ps.position_id
      LEFT JOIN Sources s ON ps.source_id = s.source_id
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

    // Group sources under each position
    const groupedPositions = positionData.rows.reduce((acc, row) => {
      const { first_name, last_name, party_affiliation, position_id, supports_position, position_description, source_id, tweet, url, date } = row;

      let position = acc.find(p => p.position_id === position_id);
      if (!position) {
        position = {
          position_id,
          first_name,
          last_name,
          party_affiliation,
          supports_position,
          position_description,
          sources: []
        };
        acc.push(position);
      }

      // Add source if it exists
      if (source_id) {
        position.sources.push({ source_id, tweet, url, date });
      }

      return acc;
    }, []);

    console.log(groupedPositions);
    return NextResponse.json({
      success: true,
      positions: groupedPositions,
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