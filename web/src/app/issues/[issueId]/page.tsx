// app/issues/[issueId]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Issue } from '@/types/issues';
import "@/styles/issues_depth.css";

type Props = {
  params: { issueId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = await params;
  const issue = await getIssue(id.issueId);
  
  return {
    title: issue.category || 'Issue not found',
    description: issue.category_description || 'Description not found'
  };
}

async function getIssue(issueId: string) {
  try {

    const res = await fetch(process.env.URL + `/api/issues/${issueId}`);
    
    if (!res.ok) {
      console.error(`API Error: ${res.status} - ${await res.text()}`);
      return undefined;
    }
    
    const data = await res.json();
    return data.positions;
    
  } catch (error) {
    console.error('Fetch error:', error);
    return undefined;
  }
}

export default async function IssueDetail({ params }: Props) {
  const id = await params;

  const positions = await getIssue(id.issueId);

  if (!positions) return notFound();

  return (
    <div>
      <div className="positions">
        {positions.map((position) => (
          <div key={position.position_id}>
            <p>{position.position_description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}