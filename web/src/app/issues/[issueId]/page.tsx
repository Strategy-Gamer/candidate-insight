// app/issues/[issueId]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Issue } from '@/types/issues';
import "@/styles/issues.css";

type Props = {
  params: { issueId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = await params;
  const issue = await getIssue(id.issueId);
  
  return {
    title: issue.issue_name || 'Issue not found',
    description: issue.issue_description || 'Description not found'
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
    return data.issue;
    
  } catch (error) {
    console.error('Fetch error:', error);
    return undefined;
  }
}

export default async function IssueDetail({ params }: Props) {
  const id = await params;

  const issue = await getIssue(id.issueId);

  if (!issue) return notFound();

  return (
    <div className="issue-detail-container">
      <h1>Issue: {issue.issue_name}</h1>
      <div className="issue-content">
        <p>Description: {issue.issue_description}</p>
      </div>
    </div>
  );
}