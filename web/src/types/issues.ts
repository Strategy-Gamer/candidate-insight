export type Issue = {
     issue_id: number;
     issue_description: string;
     issue_name: string;
};
export type SubIssue = {
     issue_id: number;
     name: string;
     sub_id: number;
     description: string;
     icon?: string | null;
};
