-- Candidate Table
CREATE TABLE Candidate (
    candidate_id SERIAL PRIMARY KEY,
    first_name VARCHAR(25) NOT NULL,
    last_name VARCHAR(25) NOT NULL,
    ethnicity VARCHAR(25),
    gender VARCHAR(25) ,
    party_affiliation VARCHAR(25), 
    state VARCHAR(10),
    profile_image_url TEXT,
    congressional_district VARCHAR(10) DEFAULT NULL,
    website_url TEXT DEFAULT NULL,
    dob DATE
);

-- Political_Issue Table
CREATE TABLE Political_Issue (
    issue_id SERIAL PRIMARY KEY,
    issue_name VARCHAR(20),
    issue_description TEXT NOT NULL
);

-- Candidate_Position Table
CREATE TABLE Candidate_Position (
    position_id SERIAL PRIMARY KEY,
    candidate_id INT REFERENCES Candidate(candidate_id) ON DELETE CASCADE,
    issue_id INT REFERENCES Political_Issue(issue_id) ON DELETE CASCADE,
    position_description TEXT NOT NULL
);

-- Sources Table
CREATE TABLE Sources (
    source_id SERIAL PRIMARY KEY,
    bias FLOAT,
    url TEXT,
    date DATE
);

-- Position_Sources Table
CREATE TABLE Position_Sources (
    position_id INT REFERENCES Candidate_Position(position_id) ON DELETE CASCADE,
    source_id INT REFERENCES Sources(source_id) ON DELETE CASCADE,
    PRIMARY KEY (position_id, source_id)
);

-- ** New data alterations **
ALTER TABLE candidate
ADD COLUMN twitter VARCHAR(25) DEFAULT NULL;

