// app/issues/[issueId]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Issue } from '@/types/issues';
import "@/styles/issues.css";

type Props = {
  params: { issueId: string };
};

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const issue = await getIssue(params.issueId);
  
//   return {
//     title: issue?.issue_name || 'Issue not found',
//     description: issue?.issue_description || 'Description not found'
//   };
// }

async function getIssue(issueId: string) {
  try {
    const res = await fetch(`/api/issues/${issueId}`);
    
    console.log('Response status:', res.status);
    const text = await res.text();
    console.log('Raw response:', text);
    
    if (!res.ok) return undefined;
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Fetch error:', error);
    return undefined;
  }
}

export default async function IssueDetail({ params }: Props) {
  const issue = await getIssue(params.issueId);

  if (!issue) return notFound();

  return (
    <div className="issue-detail-container">
      <h1>{issue.category_name}</h1>
      <div className="issue-content">
        <p>{issue.category_description}</p>
      </div>
    </div>
  );
}