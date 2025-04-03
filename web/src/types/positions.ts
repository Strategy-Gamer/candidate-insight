export type Position = {
    position_id: number,
    candidate_id: number,
    issue_id: string,
    supports_position: boolean,
    position_description: string;
};

export type Source = {
    source_id: number,
    tweet: string,
    url: string,
    date: string
};
