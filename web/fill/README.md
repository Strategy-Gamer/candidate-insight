# Political Database Mock Data Generator

This folder contains both real and mock data to be inserted into the database automatically. ```fill.js``` reads from ```candidates.txt``` and populates the Candidate table with real data, while ```mockfill.js``` reads from ```FakeCandidates.txt``` and populates all of the tables based on the mock candidate data.

## Prerequisites

- Node.js (v14 or higher recommended)
- PostgreSQL database with the schema already created (run setup.sql in pgAdmin)

## Setup
If you are using one .env file, then make sure to specify ```DB_NAME``` to be the name of either your mock DB or prod DB setup in pgAdmin depending on if you're running the real or mock script.
Otherwise, rename the .env portion from this line ```env.config({path: '../.env'})``` to either .env.prodreal, .env.devreal, or .env.devmock depending on your other .env files. 

## Usage

Run the mock script with the following command:

```
node mockfill.js [numberOfCandidates] [percentageOfIssues] refresh
```

Run the real script with the following command:

```
node fill.js
```

### Parameters for mockfill

- `numberOfCandidates`: (Optional) The number of candidate records to generate (default: 988, max: 988)
- `percentageOfIssues`: (Optional) The proportion of Political_Issues in which each candidate will have a position. If it is not specified, then each candidate will have a position for anywhere between 30 to 70 percent of the issues.
- `refresh`: (Optional) Include this keyword to clear existing data from tables before generating new data

### Examples

Generate data with default settings (988 candidates, where each candidate will have a position for 30 to 70 percent of the issues):
```
node mockill.js
```

Generate data for 100 candidates:
```
node mockfill.js 100
```

Clear existing data and generate 500 new candidate records:
```
node mockfill.js 500 refresh
```

Clear existing data and generate 500 new candidate records, where each candidate will have a position for half of the issues:
```
node mockfill.js 500 0.5 refresh
```

Clear existing data and generate 500 new candidate records, where each candidate will have a position for all of the issues:
```
node mockfill.js 500 1 refresh
```


## Troubleshooting
- If you encounter database connection issues, verify your `.env` file settings
- Other errors should only occur if the tables don't exist or you are working with an older version of the schema. Run setup.sql in pgAdmin again to fix these.
