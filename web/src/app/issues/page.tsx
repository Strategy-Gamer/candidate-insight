// This is the initial issues page
'use client';

import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { PoliticalCategory, Issue } from '@/types/issues';
import { politicalCategories } from '@/utils/politicalCategories';
/* import { issues } from '@/utils/mockIssues'; */
import "@/styles/pages/issues.css";
import PublicPolicySection from '@/components/issue_descriptions/PublicPolicy';

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
    return issues.filter(issue => issue.category === categoryId);
  } 

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
                        }}
                      >
                        <Link href={`/issues/${encodeURIComponent(subIssue.issue_name.trim().replace(/\s+/g, '-'))}`}>
                          <h4 className="sub-issue-title">{subIssue.issue_name}</h4>
                        </Link> 
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
                <PublicPolicySection />
              </div>
            )}
          </div>
      </section>
    </main>
  );
};

export default IssuesPage;