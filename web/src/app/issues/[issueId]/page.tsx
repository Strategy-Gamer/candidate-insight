// app/issues/[issueId]/page.tsx
import { notFound } from 'next/navigation';
//import type { Metadata } from 'next';
import { Issue } from '@/types/issues';
import CandidateChart from '@/components/CandidateChart';
import { Source } from '@/types/positions';
import "@/styles/pages/subissues.css";

type Props = {
  params: { issueId: string };
};

type ApiCandidatePosition = {
  position_id: number;
  first_name: string;
  last_name: string;
  party_affiliation: string;
  supports_position: boolean;
  position_description: string;
  sources: Source[];
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
  const issue: Issue = result[1];

  const getFilteredPositions = (party: string) => {
    const byParty = positions.filter((position: ApiCandidatePosition) => position.party_affiliation == party);
    const supports: number = byParty.filter((position: ApiCandidatePosition) => position.supports_position == true).length;
    const opposes: number = byParty.filter((position: ApiCandidatePosition) => position.supports_position == false).length;
  
    const config = {
      Supporters: {
        label: `${parseFloat((supports/byParty.length).toFixed(4))*100}%`,
        color: "hsl(var(--chart-1))"
      },
      Opposers: {
        label: `${parseFloat((opposes/byParty.length).toFixed(4))*100}%`,
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
      <h1>{issue.issue_name} </h1>
      <h2>{issue.issue_description}</h2>
      <div className="flex flex-row gap-12 justify-center items-center">
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
      <div className="positions">
        {positions.map((position: ApiCandidatePosition, index: number) =>(
          <div key={index} className="position">
            <p>
              <span className = "Name">{position.first_name} {position.last_name}</span>
              <span className = {`party ${position.party_affiliation}`}> ({position.party_affiliation})</span>
              <span className = {`status ${position.supports_position ? 'yes' : 'no'}`}>{position.supports_position ? " supports " : " opposes "}</span>
              {issue.issue_name} because {position.position_description}
            </p>
            {/*Potential future Code for sources*/}
            {/* <div className="sources">Sources: {position.sources.map((source, i)=> (
              <a key={i} href={source.url} target="_blank" rel="noopener noreferrer">
                "{source.tweet}"
              </a>
            ))}
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}