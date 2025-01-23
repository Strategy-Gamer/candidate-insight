import requests
import csv

# Replace with your Bearer Token
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAGk1xQEAAAAAEEK1ch1Z01QGchctEtoSRVZYh9I%3DtD4OmB2d9Ur6DS2NZKXjHO4JrwzH2cM3579qvd3fq2MWHsQUdm"

# User ID for Kamala Harris
USER_ID = "803694179079458816"

# Endpoint URL
url = f"https://api.twitter.com/2/users/{USER_ID}/tweets"

# Headers
headers = {
    "Authorization": f"Bearer {BEARER_TOKEN}"
}

# Query Parameters
params = {
    "max_results": 100,  # Max results per request (10–100)
    "tweet.fields": "created_at,text",  # Additional fields to include
    # Uncomment the next lines to scrape from specific start and end times
    # "start_time": "2023-01-01T00:00:00Z",  # ISO 8601 format
    # "end_time": "2023-12-31T23:59:59Z"
}

# Pagination loop to fetch all tweets
all_tweets = []
next_token = None

while True:
    if next_token:
        params["pagination_token"] = next_token

    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"Error: {response.status_code} - {response.text}")
        break
    
    tweets = response.json()
    all_tweets.extend(tweets.get("data", []))
    
    # Check if there is a next token
    next_token = tweets.get("meta", {}).get("next_token")
    if not next_token:
        break

# Save tweets to a CSV file
with open("kamala_harris_tweets.csv", "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["Created At", "Tweet"])  # Header row
    for tweet in all_tweets:
        writer.writerow([tweet["created_at"], tweet["text"]])

print(f"Total tweets retrieved: {len(all_tweets)}")
print("Tweets saved to kamala_harris_tweets.csv")
