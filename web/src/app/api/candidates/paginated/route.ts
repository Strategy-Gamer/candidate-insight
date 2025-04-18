// ROUTE FOR GRABBING ALL CANDIDATES
import pool from '@/utils/dbconnect';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    // Required
    const electionYear = searchParams.get('year') || '2024';
    const page: number = parseInt(searchParams.get('page') ?? '1');
    const limit: number = parseInt(searchParams.get('limit') ?? '16');

    // Optional
    const params: Record<string, string> = {};
    params["state"] = searchParams.get('state') || '';
    params["party"] = searchParams.get('party') || '';
    params["position"] = searchParams.get('position') || ''; // Check for Incumbent position?
    params["search"] = searchParams.get('search') || '';
    params["sort"] = searchParams.get('sort') || ''; // Should be DESC OR ASC
    
    const db = await pool.connect();

    try {
        let candidateQuery = `
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
            WHERE 
            cm.election_year = $1
        `

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vals: any[] = new Array(electionYear);
        let numParameters = 2;

        for (const param in params) {
            const val = params[param];
            if (val == '') continue;

            if (param == "state") {
                candidateQuery += ` AND c.state = $${numParameters}`;
                vals.push(val);
            } else if (param == "party") {
                candidateQuery += ` AND c.party_affiliation = $${numParameters}`;
                vals.push(val);
            } else if (param == "position") {
                candidateQuery += ` AND cm.incumbent = $${numParameters}`;
                vals.push(val);
            } else if (param == "search") {
                candidateQuery += ` AND LOWER(c.first_name || c.last_name) LIKE $${numParameters}`;
                vals.push(`%${val.toLowerCase().replace(/ /g, '')}%`);
            } else if (param == "sort") {
                candidateQuery += ` ORDER BY c.first_name ${val}`;
                numParameters--;
            }
            
            numParameters++;
        }

        // Limit
        vals.push(limit)
        candidateQuery += ` LIMIT $${numParameters}`
        // Offset
        vals.push((page-1) * limit);
        candidateQuery += ` OFFSET $${++numParameters};`

        const { rows } = await db.query(candidateQuery, vals);
        return NextResponse.json({ success: true, candidates: rows });

    } catch (error) {
        console.error('Error fetching candidates:', error);
        return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    } finally {
        db.release();
    }
}
