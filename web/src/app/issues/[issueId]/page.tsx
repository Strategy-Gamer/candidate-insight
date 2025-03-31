// app/issues/[issueId]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Issue } from '@/types/issues';
import CandidateChart from '@/components/CandidateChart';
import Candidates from '@/app/candidates/page';
//import "@/styles/issues_depth.css";

type Props = {
  params: { issueId: string };
};

type ApiCandidatePosition = {
  first_name: string;
  last_name: string;
  party_affiliation: string;
  issue_name: string;
  issue_description: string;
  position_description: string;
}

async function getIssue(issueId: string) {
  try {
    const res = await fetch(process.env.URL + `/api/issues/${decodeURIComponent(issueId).replace(/-/g, ' ')}`);
    
    if (!res.ok) {
      console.error(`API Error: ${res.status} - ${await res.text()}`);
      return undefined;
    }
    
    const data = await res.json();
    return [data.positions, data.issue];
    
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
  const totalDemocrats: number = positions.filter((position: ApiCandidatePosition) => position.party_affiliation == 'Democratic').length;
  const totalRepublicans: number = positions.filter((position: ApiCandidatePosition) => position.party_affiliation == 'Republican').length;
  const issue: Issue = result[1];

  const getFilteredPositions = (pos: string) => {
    const byPosition = positions.filter((position: ApiCandidatePosition) => position.position_description.split(' ')[0] == pos);
    const republicans: number = byPosition.filter((position: ApiCandidatePosition) => position.party_affiliation == 'Republican').length;
    const democrats: number = byPosition.filter((position: ApiCandidatePosition) => position.party_affiliation == 'Democratic').length;
  
    const config = {
      Democratic: {
        label: `${parseFloat((democrats/totalDemocrats).toFixed(2))*100}%`,
        color: "hsl(var(--chart-2))"
      },
      Republican: {
        label: `${parseFloat((republicans/totalRepublicans).toFixed(2))*100}%`,
        color: "hsl(var(--chart-1))"
      }
    };

    return {
      data: [
        { 
          position: "Democratic", 
          proportion: parseFloat((democrats/totalDemocrats).toFixed(2)),
          amount: democrats, 
          fill: config.Democratic.color 
        }, 
        { 
          position: "Republican", 
          proportion: parseFloat((republicans/totalRepublicans).toFixed(2)), 
          amount: republicans,
          fill: config.Republican.color 
        },      
      ],
      config
    };
  };

  return (
    <div>
      <h2>{issue.issue_name} {issue.issue_description}</h2>
      <CandidateChart 
        data={getFilteredPositions('SUPPORTS').data} 
        config={getFilteredPositions('SUPPORTS').config}
        party='Supporters'
        description='Proportion of Democratic and Republican candidates that support this issue'
      />
      <CandidateChart 
        data={getFilteredPositions('OPPOSES').data} 
        config={getFilteredPositions('OPPOSES').config}
        party='Opposers'
        description='Proportion of Democratic and Republican candidates that oppose this issue'
      />
      <div className="positions">
        {positions.map((position: ApiCandidatePosition, index: number) => (
          <div key={index} className="position">
            <h2>{position.first_name} {position.last_name} {position.position_description}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}