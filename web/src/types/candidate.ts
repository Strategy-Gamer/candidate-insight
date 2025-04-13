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