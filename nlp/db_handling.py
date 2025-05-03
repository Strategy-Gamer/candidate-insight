import psycopg
import os

user_password = "the_best_password"
database = "Candidate Insight"

# Returns four arrays, candidate_data, issue_data, position_source_data, source_data
def get_data_from_database():
    # Data
    candidate_data = []
    issue_data = []
    position_source_data = []
    source_data = []

    # Connect to database
    with psycopg.connect(dbname=database, user="postgres", password=user_password, port=5432) as conn:

        # Open cursor to perform db operations
        with conn.cursor() as cur:
            # Query database & obtain data as python objects
            cur.execute("SELECT * FROM candidate;")

            # Fetch all rows from database
            candidate_data = cur.fetchall()

            # Same for the other tables
            cur.execute("SELECT * FROM political_issue;") 
            issue_data = cur.fetchall()
            cur.execute("SELECT * FROM position_sources;") 
            position_source_data = cur.fetchall()
            cur.execute("SELECT * FROM sources;") 
            source_data = cur.fetchall()
    
    return candidate_data, issue_data, position_source_data, source_data

# Returns a string
def get_scraped_file_from_database(name):
    # As of current, the scraped data isn't on the database, but the files are on the git
    # This will be changed to use the database instead

    data = ""
    #with open('../README.md') as file:
    path = os.path.join('../scraper/', name)
    with open(path, 'r', encoding='utf-8') as file:
        data = file.read()
    return data

# Pushes a position for a candidate to the database
def push_position_to_database(candidate_first, candidate_last, issue, position):
    # Gets the candidate id by matching first/last name & issue id by matching issue name
    # then adds (or, if the candidate already has that issue defined, updates) the position

    # Connect to database
    with psycopg.connect(dbname=database, user="postgres", password=user_password, port=5432) as conn:

        # Open cursor to perform db operations
        with conn.cursor() as cur:
            # Init as -1
            candidate_id = -1
            issue_id = -1

            # TODO - Get candidate/issue id from names

            # Add position, let psycopg perform correct conversions (No SQL injections!)
            if candidate_id != -1 and issue_id != -1:
                cur.execute("INSERT INTO candidate_position (candidate_id, issue_id, position_description) VALUE (%s, %s, %s)", (candidate_id, issue_id, position))

            # Make changes persistent
            conn.commit()
    return

# Just to make sure this works
#print(get_scraped_file_from_database("andy_ogles_tn_house.txt"))