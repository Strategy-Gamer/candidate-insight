# Political Database Mock Data Generator

This script generates mock data for a political database, including candidates, political issues, and their positions on various topics.

## Overview

The data generator populates the following tables with realistic mock data:
- Candidate
- Political_Category
- Political_Issue
- Candidate_Meta
- Position_Sources
- Sources
- Candidate_Position

## Prerequisites

- Node.js (v14 or higher recommended)
- PostgreSQL database with the schema already created
- Required Node modules: `pg`, `dotenv` (for environment variables)

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your database connection in a `.env` file:
   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   DB_PORT=5432
   ```

## Usage

Run the script with the following command:

```
node generate-data.js [numberOfCandidates] [refresh]
```

### Parameters

- `numberOfCandidates`: (Optional) The number of candidate records to generate (default: 988, max: 988)
- `refresh`: (Optional) Include this keyword to clear existing data from tables before generating new data

### Examples

Generate data with default settings (988 candidates):
```
node generate-data.js
```

Generate data for 100 candidates:
```
node generate-data.js 100
```

Clear existing data and generate 500 new candidate records:
```
node generate-data.js 500 refresh
```

## Data Generation Details

- **Candidates**: Generated with realistic names and party affiliations
- **Political Issues**: Created across multiple categories (economy, healthcare, etc.)
- **Candidate Metadata**: Includes information about election years, positions, and districts
- **Candidate Positions**: Creates positions for candidates on political issues

Each candidate will be present during every election year (2022, 2024, 2026, 2028), with randomly assigned positions they're running for and other metadata.

## Customization

You can modify the following constants in the code to customize the generated data:
- `incumbentPositions`: Types of positions candidates might already hold
- `runningForPositions`: Positions candidates can run for
- `stateCodes`: State abbreviations for congressional districts

## Troubleshooting

- If you encounter database connection issues, verify your `.env` file settings
- For "Invalid number of candidates" errors, ensure the number is between 1 and 988
- If tables don't exist, run the schema creation script first (not included in this repository)
