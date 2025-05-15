export type Position = {
    position_id: number,
    candidate_id: number,
    issue_id: string,
    supports_position: boolean,
    position_description: string;
};

export type Source = {
    position_id?: number,
    source_id: number,
    source_type: string,
    tweet: string,
    url: string,
    date: string,
    scraped_on: string
};

export type ApiCandidatePosition = {
    position_id: number;
    first_name: string;
    last_name: string;
    party_affiliation: string;
    twitter: string;
    supports_position: boolean;
    position_description: string;
}
