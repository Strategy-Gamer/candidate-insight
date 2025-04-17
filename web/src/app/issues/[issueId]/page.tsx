// app/issues/[issueId]/page.tsx
import { notFound } from 'next/navigation';
//import type { Metadata } from 'next';
import { Issue } from '@/types/issues';
import CandidateChart from '@/components/CandidateChart';
import { ApiCandidatePosition } from '@/types/positions';
import Positions from '@/components/Positions';
import pool from '@/utils/dbconnect';
import "@/styles/pages/subissues.css";

type Props = {
  params: { issueId: string };
};

/* Avoid making an API call to get the issueId. */
async function getIssue(issueId: string) {
  const db = await pool.connect();
  try {
    const issueData = await db.query(
      `SELECT issue_id, issue_name, issue_description 
      FROM Political_Issue 
      WHERE issue_name = $1`,
      [decodeURIComponent(issueId).replace(/-/g, ' ')]
    );

    if (issueData.rowCount === 0) {
      return undefined;
    }

    const issue = issueData.rows[0].issue_id;

    const positionData = await db.query(
      `SELECT 
        c.first_name, 
        c.last_name,
        c.twitter,
        c.party_affiliation,
        cp.position_id,  
        cp.supports_position,
        cp.position_description
      FROM Candidate_Position cp
      JOIN Candidate c ON cp.candidate_id = c.candidate_id
      WHERE cp.issue_id = $1;`,
      [issue]
    );

    if (positionData.rowCount === 0) {
      return undefined;
    }

    return [positionData.rows, issueData.rows[0]];
    
  } catch (error) {
    console.error('Fetch error:', error);
    return undefined;
  }
}

export default async function IssueDetail({ params }: Props) {
  const id = await params;

  const result = await getIssue(id.issueId);

  if (!result) return notFound();

  const positions: ApiCandidatePosition[] = result[0];
  const issue: Issue = result[1];

  const getFilteredPositions = (party: string) => {
    const byParty = positions.filter((position: ApiCandidatePosition) => position.party_affiliation == party);
    const supports: number = byParty.filter((position: ApiCandidatePosition) => position.supports_position == true).length;
    const opposes: number = byParty.filter((position: ApiCandidatePosition) => position.supports_position == false).length;
  
    const config = {
      Supporters: {
        label: `${parseFloat(((supports/byParty.length)*100).toFixed(0))}%`,
        color: "hsl(var(--chart-1))"
      },
      Opposers: {
        label: `${parseFloat(((opposes/byParty.length)*100).toFixed(0))}%`,
        color: "hsl(var(--chart-2))"
      }
    };

    const data = [
      { 
        position: "Supporters", 
        amount: supports, 
        fill: config.Supporters.color 
      }, 
      { 
        position: "Opposers", 
        amount: opposes,
        fill: config.Opposers.color 
      }      
    ];

    if (supports > 0 && opposes > 0) return { data, config };

    if (supports > 0) 
      return { data: [data[0]], config: { Supporters: config.Supporters } };
     
    return { data: [data[1]], config: { Opposers: config.Opposers } };
    
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-evenly md:flex-row gap-12 items-center p-3">
        <div className="flex flex-col gap-4 justify-center items-center">
          <CandidateChart 
            data={getFilteredPositions('Democratic').data} 
            config={getFilteredPositions('Democratic').config}
            party='Democrats'
            description="Proportion of Democratic candidates that support or oppose this issue."
          />
          <CandidateChart 
            data={getFilteredPositions('Republican').data} 
            config={getFilteredPositions('Republican').config}
            party='Republicans'
            description='Proportion of Republican candidates that support or oppose this issue.'
          />
        </div>
        <Positions positions={positions} issue={issue} />
      </div>
    </div>
  );
}