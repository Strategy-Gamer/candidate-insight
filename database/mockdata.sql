-- This file contains mock data for the database tables to be used for testing and development purposes.
INSERT INTO Candidate (first_name, last_name, ethnicity, gender, party_affiliation, state, profile_image_url, congressional_district, website_url, dob)
VALUES
('John', 'Doe', 'Caucasian', 'Male', 'Independent', 'NY', 'https://example.com/john_doe.jpg', 'NY-10', 'www.johndoe.com', '1975-06-15'),
('Jane', 'Smith', 'Hispanic', 'Female', 'Democrat', 'CA', 'https://example.com/jane_smith.jpg', 'CA-12', 'www.janesmith.com', '1985-04-22'),
('Robert', 'Johnson', 'African American', 'Male', 'Republican', 'TX', 'https://example.com/robert_johnson.jpg', 'TX-07', 'www.robertjohnson.com', '1970-09-12');

-- Inserting political issues
INSERT INTO Political_Issue (issue_name, issue_description)
VALUES
('Healthcare', 'Access to affordable healthcare for all citizens.'),
('Education', 'Improving public education and increasing teacher pay.'),
('Climate Change', 'Addressing global warming and promoting renewable energy.');

-- Inserting candidate positions on political issues
INSERT INTO Candidate_Position (candidate_id, issue_id, position_description)
VALUES
(1, 1, 'Supports universal healthcare with private options available.'),
(1, 2, 'Advocates for free college tuition for public universities.'),
(2, 1, 'Proposes a public option alongside private insurers.'),
(2, 3, 'Supports a Green New Deal for renewable energy infrastructure.'),
(3, 2, 'Focuses on increasing school choice through charter programs.'),
(3, 3, 'Believes climate change is not a pressing issue.');

-- Inserting sources for candidate positions
INSERT INTO Sources (bias, url, date)
VALUES
(0.2, 'https://example.com/article_about_john_doe', '2024-01-15'),
(-0.5, 'https://example.com/article_about_jane_smith', '2024-02-20'),
(0.8, 'https://example.com/article_about_robert_johnson', '2024-03-05');

-- Associating candidate positions with sources
INSERT INTO Position_Sources (position_id, source_id)
VALUES
(1, 1),  -- Source for John Doe's healthcare position
(2, 2),  -- Source for John Doe's education position
(4, 2),  -- Source for Jane Smith's climate change position
(6, 3);  -- Source for Robert Johnson's climate change position

