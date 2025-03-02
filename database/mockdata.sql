-- Insert mock Candidates
INSERT INTO Candidate (first_name, last_name, ethnicity, gender, party_affiliation, state, profile_image_url, congressional_district, website_url, twitter, dob)
VALUES 
('John', 'Doe', 'Caucasian', 'Male', 'Democratic', 'CA', 'https://example.com/johndoe.jpg', '12', 'https://johndoe.com', '@JohnDoe', '1975-06-15'),
('Jane', 'Smith', 'African American', 'Female', 'Republican', 'TX', 'https://example.com/janesmith.jpg', '7', 'https://janesmith.com', '@JaneSmith', '1980-09-23');

-- Insert mock Political Categories
INSERT INTO Political_Category (category, category_description, icon)
VALUES 
('Healthcare', 'Policies related to healthcare and medical services', 'health_icon.png'),
('Economy', 'Economic policies, taxation, and financial regulations', 'economy_icon.png'),
('Education', 'Policies regarding education and student welfare', 'education_icon.png');

-- Insert mock Sub-Issues
INSERT INTO Sub_Issue (issue_name, category_id, issue_decription)
VALUES 
('Universal Healthcare', 'Healthcare', 'Support for government-funded healthcare for all citizens'),
('Tax Cuts', 'Economy', 'Support for reducing corporate and individual tax rates'),
('Student Loan Forgiveness', 'Education', 'Support for federal student loan forgiveness programs');

-- Insert mock Candidate Positions
INSERT INTO Candidate_Position (candidate_id, issue_id, position_description)
VALUES 
(1, 'Universal Healthcare', 'Supports Medicare for All and increased government healthcare funding'),
(2, 'Tax Cuts', 'Advocates for significant corporate tax reductions to boost economic growth'),
(1, 'Student Loan Forgiveness', 'Supports partial loan forgiveness for low-income graduates');

-- Insert mock Sources
INSERT INTO Sources (bias, url, date)
VALUES 
(0.5, 'https://news.example.com/article1', '2024-02-10'),
(-0.3, 'https://anothernews.com/economy-tax-cuts', '2024-02-15'),
(0.2, 'https://eduportal.com/loan-forgiveness-update', '2024-01-20');

-- Insert mock Position Sources
INSERT INTO Position_Sources (position_id, source_id)
VALUES 
(1, 1),
(2, 2),
(3, 3);