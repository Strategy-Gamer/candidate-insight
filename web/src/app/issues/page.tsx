// This is the issues page
'use client';

import type { NextPage } from 'next';
import React, { useState, Component, useEffect } from 'react';
import { useRouter } from 'next/navigation';
//import { Issue, SubIssue } from '@/types/issues';
import "@/styles/issues.css";

type IssueCategory = {
  issue_id: number;
  issue_name: string;
  issue_description: string;
  category: string;
  category_description: string;
  icon: string;
}

// This must match the categories in the database
const categories = ["Economy", "Healthcare", "Environment", "Gun Control"];

const IssuesPage: NextPage = () => {
  const router = useRouter();
  const [issues, setIssues] = useState<IssueCategory[]>([]);

  useEffect(() => {
    /*const mockIssues: Issue[] = [
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
    ];*/

    const getIssues = async () => {
      const response = await fetch('/api/issues');
      const data = await response.json();

      if (data.success) {
        setIssues(data.issues);
      } else {
        console.error(data.error);
      }
    };

    // setIssues(mockIssues);
    getIssues();
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
        {categories.map((category) => (
          <div 
            key={category} 
            className="issueCard" 
            role="button" 
            tabIndex={0}
          >
            <h2 className="issueTitle">{category}</h2>
            {issues
              .filter(issue => issue.category === category)
              .map((issue) => (
                <div 
                  key={issue.issue_id} 
                  onClick={() => handleCardClick(String(issue.issue_name))}
                >
                  <p className="issueDescription">
                    {issue.issue_name} {issue.issue_description}
                  </p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default IssuesPage;