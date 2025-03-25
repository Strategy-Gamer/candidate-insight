// This is the initial issues page
'use client';

import type { NextPage } from 'next';
import React, { useState, Component, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PoliticalCategory, Issue } from '@/types/issues';
import { politicalCategories } from '@/utils/politicalCategories';
import { issues } from '@/utils/mockIssues';
import "@/styles/pages/issues.css";

const defaultDescription = {
  title: "Public Policy",
  content: `Public policy is a collection of elements such as laws, programs, regulations, and actions that address societal problems. Put more simply, public policy is the combination of what a government decides to do and what it doesn't do regarding a problem. In the United States, public policy is enacted by the government through elected officials on behalf of their constituents. This includes the local, state, and federal government. Policymakers often draft policies that aid the interests for as many groups as possible. For example, tax cuts, while they may be lobbied for by corporations, still grant benefits to the average person.

Before a policy can be implemented, it must be made. The policy making process or cycle can be defined as:

1. Issue identification - sometimes referred to as agenda setting, this is the process of identifying issues that require government attention
2. Policy formulation - creating the objectives of the policy and outlining how they can be achieved
3. Legitimation - the process of gathering support for the policy through various means, such as referendums
4. Implementation - establishing the means in which the policy will be enacted, such as a program, group, or agency
5. Evaluation - the process of measuring a policy's success
6. Maintenance - this includes tweaking the policy to aid its success, or the process of deciding to keep or terminate the policy based on its success (or lack thereof)

In practice, policy making is much more complicated, but the above still serves as a good, high-level overview of the process.`
};

type ApiIssue = Issue & {
  category: string;
  category_description: string;
  icon?: string;
};

const IssuesPage: NextPage = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PoliticalCategory | null>(null);
  const [issues, setIssues] = useState<ApiIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // fetch the issues first
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch('/api/issues');
        const data = await response.json();

        if (data.success) {
          setIssues(data.issues);
        } else {
          setError('Failed to load issues');
        }
      } catch (err) {
        setError('Error loading issues');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const handleCategoryClick = (category: PoliticalCategory) => {
    setSelectedCategory(category);
  }

  const handleMouseEnter = (category: string) => {
    setActiveDropdown(category);
  }

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const getSubIssues = (categoryId: string): ApiIssue[] => {
    return issues.filter(issue => issue.category_id === categoryId);
  }
  
  /* change the route in candidates to this format too */
  const handleIssueClick = (subIssue: ApiIssue) => {
    const routeName = encodeURIComponent(subIssue.issue_name.trim().replace(/\s+/g, '-'));
    router.push(`/issues/${routeName}`);
  };

  /* replace with shadcn skeleton */
  if (loading) {
    return <p>Loading issues...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <main className="issues-page">
      
      <section className="categories-section">
        <ul className="horizontal-menu">
          {politicalCategories.map((category) => (
            <li 
              key={category.category}
              className={`menu-item ${selectedCategory?.category === category.category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={() => handleMouseEnter(category.category)}
              onMouseLeave={handleMouseLeave}
            >
              <button className={`menu-button ${selectedCategory?.category === category.category ? 'active' : ''}`}>
                {category.category}
              </button>
              
              {activeDropdown === category.category && (
                <div className="dropdown-content">
                  <ul className="sub-issues-list">
                    {getSubIssues(category.category).map((subIssue) => (
                      <li 
                        key={`${subIssue.category_id}-${subIssue.issue_name}`}
                        className="sub-issue-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIssueClick(subIssue);
                        }}
                      >
                        <h4 className="sub-issue-title">{subIssue.issue_name}</h4>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
        
        {/* will change to individual components probably */}
        <div className="description-container">
            {selectedCategory ? (
              <div className="category-description">
                <h2>{selectedCategory.category}</h2>
                <div className="description-content">
                  {selectedCategory.category_description}
                </div>
              </div>
            ) : (
              <div className="category-description">
                <h2>{defaultDescription.title}</h2>
                <div className="description-content whitespace-preserve">
                  {defaultDescription.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
      </section>
    </main>
  );
};

export default IssuesPage;