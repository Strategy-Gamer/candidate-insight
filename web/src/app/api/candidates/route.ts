// ROUTE FOR GRABBING ALL CANDIDATES
import pool from '../../../utils/dbconnect';
import { Candidate } from '@/types/candidate';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const electionYear = searchParams.get('year') || '2024';
    
    const db = await pool.connect();

    try {
        const candidateQuery = `
            SELECT
                c.first_name,
                c.last_name,
                c.party_affiliation,
                c.state,
                c.profile_image_url,
                cm.election_year,
                cm.congressional_district,
                cm.incumbent_position,
                cm.running_for_position
            FROM candidate c left join candidate_meta cm ON c.candidate_id = cm.candidate_id
            WHERE cm.election_year = $1
        `
        const { rows } = await db.query(candidateQuery, [electionYear]);
        return NextResponse.json({ success: true, candidates: rows });

    } catch (error) {
        console.error('Error fetching candidates:', error);
        return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    } finally {
        db.release();
    }
}


