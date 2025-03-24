export type PoliticalCategory = {
     category: string;
     category_description: string;
     icon?: string;
};

export type SubIssue = {
     issue_name: string;
     category_id: string;
     issue_description: string;
};
