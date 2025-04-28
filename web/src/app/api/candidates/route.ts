// ROUTE FOR GRABBING ALL CANDIDATES
import pool from '../../../utils/dbconnect';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const electionYear = searchParams.get('year') || '2024';
    const validYears = ["2028", "2026", "2024", "2022"];
    
    if (!validYears.includes(electionYear)) {
        return NextResponse.json({
            success: false,
            error: "Invalid election year"
        }, { status: 400});
    }

    // Required
    const page: number = parseInt(searchParams.get('page') ?? '1');
    const limit: number = parseInt(searchParams.get('limit') ?? '16');

    // Optional
    const state = searchParams.get('state') || '';
    const party = searchParams.get('party') || '';
    const position = searchParams.get('position') || ''; 
    const search = searchParams.get('search') || '';

    const db = await pool.connect();
    try {

        let candidateQuery = `
            SELECT
                c.candidate_id,
                c.first_name,
                c.last_name,
                c.party_affiliation,
                c.state,
                c.profile_image_url,
                c.dob,
                cm.election_year,
                cm.congressional_district,
                cm.incumbent_position,
                cm.running_for_position
            FROM candidate_meta cm 
            JOIN candidate c ON cm.candidate_id = c.candidate_id
            WHERE cm.election_year = $1
        `;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vals: any[] = new Array(electionYear);
        let filterQuery = '';
        let numParameters = 2;

        if (state !== '') {
            filterQuery += ` AND c.state = $${numParameters++}`
            vals.push(state);
        }
        if (party !== '') {
            filterQuery += ` AND c.party_affiliation = $${numParameters++}`
            vals.push(party);
        }
        if (position !== '') {
            // Add parentheses around the OR condition
            filterQuery += ` AND (cm.incumbent_position ILIKE $${numParameters++} OR cm.running_for_position ILIKE $${numParameters++})`;
            vals.push(position); 
            vals.push(position);
        }
        if (search !== '') {
            filterQuery += ` AND LOWER(c.first_name || c.last_name) LIKE $${numParameters++}`;
            vals.push(`%${search}%`);
        }

        const totalQuery = `
            SELECT COUNT(*) as total
            FROM candidate_meta cm
            JOIN candidate c ON cm.candidate_id = c.candidate_id
            WHERE cm.election_year = $1 ${filterQuery}
        `;

        candidateQuery += filterQuery;
        
        vals.push(limit)
        candidateQuery += ` LIMIT $${numParameters++}`

        vals.push((page-1) * limit);
        candidateQuery += ` OFFSET $${numParameters};`
   
        const [result, total] = await Promise.all([
            db.query(candidateQuery, vals),
            db.query(totalQuery, vals.slice(0, vals.length - 2))
        ]);

        return NextResponse.json({ success: true, candidates: result.rows, total: total.rows[0].total});

    } catch (error) {
        console.error('Error fetching candidates:', error);
        return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    } finally {
        db.release();
    }
}