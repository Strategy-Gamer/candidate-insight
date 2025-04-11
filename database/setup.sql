-- Run these delete statements before the create statements to clear the old schema if needed
DROP TABLE IF EXISTS Candidate CASCADE;
DROP TABLE IF EXISTS Candidate_Meta CASCADE;
DROP TABLE IF EXISTS Political_Category CASCADE;
DROP TABLE IF EXISTS Political_Issue CASCADE;
DROP TABLE IF EXISTS Candidate_Position CASCADE;
DROP TABLE IF EXISTS Sources CASCADE;
DROP TABLE IF EXISTS Position_Sources CASCADE;
------------------------------------------------------------

-- Candidate Table
CREATE TABLE Candidate (
    candidate_id SERIAL PRIMARY KEY,
    first_name VARCHAR(25) NOT NULL,
    last_name VARCHAR(25) NOT NULL,
    gender VARCHAR(25),
    party_affiliation VARCHAR(25), 
    state VARCHAR(2),
    profile_image_url TEXT DEFAULT NULL,
    website_url TEXT DEFAULT NULL,
    twitter VARCHAR(50) DEFAULT NULL,
    dob DATE,
    dob_text VARCHAR DEFAULT NULL
);

-- Candidate Election Table
CREATE TABLE Candidate_Meta (
    election_year VARCHAR(10) NOT NULL,
    candidate_id INT NOT NULL REFERENCES Candidate(candidate_id) ON DELETE CASCADE,
    congressional_district VARCHAR(5),
    incumbent_position VARCHAR(25),
    running_for_position VARCHAR(25),
    election_date DATE,
    term_end_date DATE,
    won_election BOOLEAN,
    description TEXT,
    PRIMARY KEY (election_year, candidate_id) 
);

-- Political_Issue Table
CREATE TABLE Political_Category (
    category VARCHAR(25) PRIMARY KEY,
    category_description TEXT NOT NULL,
    icon VARCHAR(25)
);

CREATE TABLE Political_Issue (
    issue_id SERIAL PRIMARY KEY,
    issue_name VARCHAR(25),
    category_id VARCHAR(25) REFERENCES Political_Category(category) ON DELETE CASCADE,
    issue_description TEXT NOT NULL
);

-- Candidate_Position Table
CREATE TABLE Candidate_Position (
    position_id SERIAL PRIMARY KEY,
    candidate_id INT REFERENCES Candidate(candidate_id) ON DELETE CASCADE,
    issue_id INT REFERENCES Political_Issue(issue_id) ON DELETE CASCADE,
    supports_position BOOLEAN NOT NULL,
    position_description TEXT NOT NULL,
    UNIQUE (candidate_id, issue_id)
);

-- Sources Table
CREATE TABLE Sources (
    source_id SERIAL PRIMARY KEY,
    tweet TEXT DEFAULT NULL,
    url TEXT,
    date DATE
);

-- Position_Sources Table
CREATE TABLE Position_Sources (
    position_id INT REFERENCES Candidate_Position(position_id) ON DELETE CASCADE,
    source_id INT REFERENCES Sources(source_id) ON DELETE CASCADE,
    PRIMARY KEY (position_id, source_id)
);

-- Scraped data placeholder
CREATE TABLE Scraped_Data (
    id SERIAL PRIMARY KEY,
    scraped_on DATE,
    website TEXT,
    raw_data TEXT
);

