import requests
import os
from datetime import datetime

BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAGk1xQEAAAAAR11kwjbQGZHWaBYL4cHuXnTSfBs%3DXNPn2guqqztAq1MEqWhJ18TnSPafCnIO2pfyBGB7ykpN4smWPL"

USERNAME = "DaveMcCormickPA"

# Define output file so we can timestamp it before importing tweets 
output_file = "DaveMcCormickPA.txt"

# Add a "Scraped on" timestamp at the top of new files
if not os.path.exists(output_file):
    with open(output_file, "w", encoding="utf-8") as file:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        file.write(f"Scraped on: {timestamp}\n\n")

# API endpoint
url = f"https://api.twitter.com/2/users/by/username/{USERNAME}"

# Headers
headers = {
    "Authorization": f"Bearer {BEARER_TOKEN}"
}

# Make the request
response = requests.get(url, headers=headers)

# Check response
if response.status_code == 200:
    user_data = response.json()
    user_id = user_data.get("data", {}).get("id")
    print(f"User ID for {USERNAME}: {user_id}")
else:
    print(f"Error: {response.status_code} - {response.text}")

# Endpoint URL
url = f"https://api.twitter.com/2/users/{user_id}/tweets"

# Query Parameters
params = {
    # "max_results": 100,  # Max results per request (10–100)
    "tweet.fields": "created_at,text",  # Additional fields to include
    "start_time": "2024-05-04T00:00:00Z",  # ISO 8601 format
    "end_time": "2024-05-22T13:51:09.000Z"  
}

# Pagination loop to fetch all requested tweets
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

# Save formatted tweets to a plain text file
with open(output_file, "a", encoding="utf-8") as txtfile:
    for tweet in all_tweets:
        txtfile.write(f"{tweet['created_at']}\n{tweet['text']}\n\n")

print(f"Total tweets retrieved: {len(all_tweets)}")
print(f"Updated {output_file} with new tweets.")