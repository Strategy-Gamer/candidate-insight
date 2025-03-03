// This is the issues page
'use client';

import type { NextPage } from 'next';
import React, { useState, Component, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Issue, SubIssue } from '@/types/issues';
import "@/styles/issues.css";

const mockSubIssues: SubIssue[] = [
  {
    issue_id: 1,
    name: "National Budget",
    sub_id: 1,
    description: "The national budget, defined by the amount of money spent by the US government as pertaining to public education, the military, Social Security, and Medicare/Medicaid.",
    icon: null
  },
  {
    issue_id: 2,
     name: "NATO",
     sub_id: 1,
     description: "NATO, or the North Atlantic Treaty Organization, is a group of 32 member states formed during the Cold War with a purpose of defending against perceived and actual Soviet aggression.",
     icon: null
  },
  {
    issue_id: 3,
    name: "LGBTQ+ Rights",
    sub_id: 1,
    description: "The rights, such as marriage, adoption, competing in sports for one's accepted sex/gender, and medical treatment, for anyone who isn't straight and cisgender.",
    icon: null
  },
];


const IssuesPage: NextPage = () => {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const mockIssues: Issue[] = [
      {
        issue_name: "Economy",
        issue_description: "Issues pertaining to economic issues, such as taxes, national budget, interest rates, and the stock market.",
        issue_id: 1,
      },
      {
        issue_name: "Foreign Policy",
        issue_description: "Issues pertaining to foreign policy, such as trade, diplomacy, tariffs, NATO, and the UN.",
        issue_id: 2,
      },
      {
        issue_name: "Culture",
        issue_description: "Issues pertaining to social ideas or concepts, such as LGBTQ+ rights, womens' rights, DEI, and other initiatives.",
        issue_id: 3,
      }
    ];

    setIssues(mockIssues);
  }, []);

  const handleCardClick = async (issueId: string) => {
    alert(`Pushing:${issueId}`);

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
            key={issue.issue_id} 
            className = "issueCard"
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick(String(issue.issue_id))}
            >
            <h2 className = "issueTitle">{issue.issue_name}</h2>
            <p className = "issueDescription">{issue.issue_description}</p>
          </div>
        )))}
      </div>
    </section>
  );
};

export default IssuesPage;