export type Issue = {
     category: string;
     category_description: string;
     icon: string;
};
export type SubIssue = {
     issue_id: number;
     name: string;
     sub_id: number;
     description: string;
     icon?: string | null;
};
