import { PoliticalCategory, SubIssue } from "@/types/issues"

export const politicalCategories: PoliticalCategory[] = [
  {
    category: 'Healthcare',
    category_description: 'Policies related to medical care and insurance.',
    icon: 'healthcare_icon.png',
  },
  {
    category: 'Economy',
    category_description: 'Issues regarding taxation, employment, and business.',
    icon: 'economy_icon.png',
  },
  {
    category: 'Environment',
    category_description: 'Policies addressing climate change and sustainability.',
    icon: 'environment_icon.png',
  },
  {
    category: 'Education',
    category_description: 'Funding and reforms for public and private education.',
    icon: 'education_icon.png',
  },
  {
    category: 'Gun Control',
    category_description: 'Regulations regarding firearm ownership and use.',
    icon: 'gun_control_icon.png',
  },
  {
    category: 'Foreign Policy',
    category_description: 'Diplomatic and military strategies.',
    icon: 'foreign_policy_icon.png',
  },
  {
    category: 'Immigration',
    category_description: 'Policies on border security and citizenship.',
    icon: 'immigration_icon.png',
  },
  {
    category: 'Social Issues',
    category_description: 'Civil rights, LGBTQ+ rights, and religious freedoms.',
    icon: 'social_issues_icon.png',
  },
];

export const subIssues: SubIssue[] = [
  {
    issue_name: 'Medicare Expansion',
    category_id: 'Healthcare',
    issue_description: 'Proposals to expand Medicare coverage.'
  },
  {
    issue_name: 'Universal Healthcare',
    category_id: 'Healthcare',
    issue_description: 'Policies to implement a government-funded health system.'
  },
  {
    issue_name: 'Corporate Taxation',
    category_id: 'Economy',
    issue_description: 'Tax rates and policies affecting businesses.'
  },
  {
    issue_name: 'Minimum Wage', 
    category_id: 'Economy',
    issue_description: 'Debates on raising or maintaining wage levels.',
  },
  {
    issue_name: 'Climate Action',
    category_id: 'Environment',
    issue_description: 'Efforts to combat climate change.',
  },
  {
    issue_name: 'Renewable Energy',
    category_id: 'Environment',
    issue_description: 'Investments and policies promoting green energy.',
  },
  {
    issue_name: 'Public School Funding',
    category_id: 'Education',
    issue_description: 'Allocating federal and state resources for education.',
  },
  {
    issue_name: 'Charter Schools',
    category_id: 'Education',
    issue_description: 'Policies regarding publicly funded private schools.',
  },
  {
    issue_name: 'Background Checks',
    category_id: 'Gun Control',
    issue_description: 'Stronger background check laws for gun ownership.',
  },
  {
    issue_name: 'Gun Rights',
    category_id: 'Gun Control',
    issue_description: 'Protection of Second Amendment rights.',
  },
  {
    issue_name: 'Military Spending',
    category_id: 'Foreign Policy',
    issue_description: 'Funding levels for defense and international interventions.',
  },
  {
    issue_name: 'Border Security',
    category_id: 'Immigration',
    issue_description: 'Strengthening or reforming border protection policies.',
  },
  {
    issue_name: 'LGBTQ+ Rights',
    category_id: 'Social Issues',
    issue_description: 'Equal rights and protections for LGBTQ+ individuals.',
  },
];