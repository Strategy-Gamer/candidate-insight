// This is the issues page
'use client';

import type { NextPage } from 'next';
import React, { useState, Component, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Issue, SubIssue } from '@/types/issues';
import "@/styles/issues.css";

const IssuesPage: NextPage = () => {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const mockIssues: Issue[] = [
      {
        category: "Healthcare",
        category_description: "Access to affordable healthcare for all citizens.",
        icon: "health_icon.png",
      },
      {
        category: "Economy",
        category_description: "Economic policies, taxation, and financial regulations.",
        icon: "education_icon.png",
      },
      {
        category: "Education",
        category_description: "Policies regarding education and student welfare.",
        icon: "education_icon.png",
      }
    ];

    setIssues(mockIssues);
  }, []);

  const handleCardClick = async (issueId: string) => {
    const response = await fetch (`/api/issues/${issueId}`);
    const data = await response.json();

    if (data.success) {
      router.push(`/issues/${issueId}`);
    } else {
      alert('Issue not found.');
      console.error(data.error);
    }
  };

  return (
    <section className="issuesContainer">
      <h1>Political Issues</h1>
      <div className= "issuesList">
        {issues.map((issue => (
          <div 
            key={issue.category} 
            className = "issueCard"
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick(String(issue.category))}
            >
            <h2 className = "issueTitle">{issue.category}</h2>
            <p className = "issueDescription">{issue.category_description}</p>
          </div>
        )))}
      </div>
    </section>
  );
};

export default IssuesPage;