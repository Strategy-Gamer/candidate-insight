export type Candidate = {
  candidate_id: number;
  first_name: string;
  last_name: string;
  ethnicity?: string | null; // Nullable fields must allow null
  gender?: string | null;
  party_affiliation?: string | null;
  state?: string | null;
  profile_image_url?: string | null;
  congressional_district?: string | null;
  website_url?: string | null;
  dob?: string | null; // Date will be returned as a string
};