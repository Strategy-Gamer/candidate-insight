'use client';

import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { PoliticalCategory, Issue } from '@/types/issues';
import { politicalCategories } from '@/utils/politicalCategories';
import "@/styles/pages/issues.css";
import "@/styles/pages/issues_mobile.css";
import { Skeleton } from '@/components/ui/skeleton';
import PublicPolicySection from '@/components/issue_descriptions/PublicPolicy';
import ImmigrationPolicySection from '@/components/issue_descriptions/Immigration';
import CivilLibertiesPolicySection from '@/components/issue_descriptions/CivilLiberties';
import ForeignPolicySection from '@/components/issue_descriptions/ForeignPolicy';
import HealthcarePolicySection from '@/components/issue_descriptions/Healthcare';
import EconomyPolicySection from '@/components/issue_descriptions/Economy';
import EnvironmentPolicySection from '@/components/issue_descriptions/Environment';
import EducationPolicySection from '@/components/issue_descriptions/Education';
import SocialIssuesPolicySection from '@/components/issue_descriptions/SocialIssues';

type ApiIssue = Issue & {
  category: string;
  category_description: string;
  icon?: string;
};

const PolicySections: Record<string, React.FC> = {
  "Public Policy": PublicPolicySection,
  "Healthcare": HealthcarePolicySection,
  "Economy": EconomyPolicySection,
  "Environment": EnvironmentPolicySection,
  "Education": EducationPolicySection,
  "Civil Liberties": CivilLibertiesPolicySection,
  "Foreign Policy": ForeignPolicySection,
  "Immigration": ImmigrationPolicySection,
  "Social Issues": SocialIssuesPolicySection,
};

const IssuesPage: NextPage = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PoliticalCategory | null>(null);
  const [issues, setIssues] = useState<ApiIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

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

    // Check if mobile on mount and on resize
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
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

  const renderPolicySection = () => {
    if (!selectedCategory) {
      return <PublicPolicySection />;
    }

    const CategoryComponent = PolicySections[selectedCategory.category];
    
    if (CategoryComponent) {
      return <CategoryComponent />;
    }
    
    return (
      <div className="category-description">
        <h2>{selectedCategory.category}</h2>
        <div className="description-content">
          {selectedCategory.category_description}
        </div>
      </div>
    );
  };

  const handleAccordionClick = (category: PoliticalCategory, categoryName: string) => {
    setSelectedCategory(category);
    setOpenCategories(prev => {
      const next = new Set(prev);
      next.has(categoryName) ? next.delete(categoryName) : next.add(categoryName);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        {isMobile ? (
          <p>Loading candidates...</p>
        ) : (
          <div className="pt-[32px] max-w-[1200px] mx-auto space-y-8">
            <Skeleton className="h-[50px] rounded-none w-full" />

            <div className="space-y-4">
              <Skeleton className="h-10 mx-auto w-[300px]" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[70%]" />

                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <section className="issues-page">
      <section className="categories-section">
        {!isMobile && (
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
        )}

        {isMobile && (
          <ul className="accordion-menu">
            {politicalCategories.map((category) => (
              <div 
                key={category.category}
                className={`accordion-item ${openCategories.has(category.category) ? 'active' : ''}`}
              >
                <button 
                  className="accordion-header"
                  onClick={() => handleAccordionClick(category, category.category)}
                  aria-expanded={openCategories.has(category.category)}
                  aria-controls={`accordion-content-${category.category}`} 
                >
                  {category.category}
                  <span className="accordion-icon">{openCategories.has(category.category) ? '-' : '+'}</span>
                </button>
                
                <div
                  id={`accordion-content-${category.category}`}
                  className="accordion-content"
                  style={{
                    maxHeight: openCategories.has(category.category) ? '1000px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-out'
                  }}
                >
                  <ul className="mobile-sub-issues-list">
                    {getSubIssues(category.category).map((subIssue) => (
                      <li key={subIssue.issue_name} className="mobile-sub-issue-item">
                        <Link href={`issues/${encodeURIComponent(subIssue.issue_name.trim().replace(/\s+/g, '-'))}`}>
                          {subIssue.issue_name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </ul>
        )}

        <div className="description-container mt-8 mb-8">
          {renderPolicySection()}
        </div>
      </section>
    </section>
  );
};

export default IssuesPage;