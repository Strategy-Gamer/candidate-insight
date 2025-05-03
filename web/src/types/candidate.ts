export type Candidate = {
  candidate_id: number;
  first_name: string;
  last_name: string;
  gender?: string | null;
  party_affiliation?: string | null;
  state?: string | null;
  profile_image_url?: string | null;
  website_url?: string | null;
  twitter?: string | null;
  dob?: string | null;
};

export type ApiCandidate = Candidate & {
  election_year: string;
  congressional_district: number | null;
  incumbent_position: string;
  running_for_position: string;
  election_date: string;
  term_end_date: string;
  description: Text;
};