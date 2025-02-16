import requests
import os
import time

BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAGk1xQEAAAAAR11kwjbQGZHWaBYL4cHuXnTSfBs%3DXNPn2guqqztAq1MEqWhJ18TnSPafCnIO2pfyBGB7ykpN4smWPL"

USERNAME = "SamBrownForNV"

# API endpoint for user lookup
url = f"https://api.twitter.com/2/users/by/username/{USERNAME}"

# Headers
headers = {
    "Authorization": f"Bearer {BEARER_TOKEN}",
    "Content-Type": "application/json"
}

# Get user ID
response = requests.get(url, headers=headers)

if response.status_code == 200:
    user_data = response.json()
    user_id = user_data.get("data", {}).get("id")
    print(f"User ID for {USERNAME}: {user_id}")
else:
    print(f"Error: {response.status_code} - {response.text}")
    exit()

# Define the output file name
output_file = "SamBrownNV.txt"

# Function to get last tweet date from the file
def get_last_tweet_date(file_name):
    """Reads the last tweet timestamp from the file to avoid duplicates."""
    if not os.path.exists(file_name):
        return "2024-05-04T00:00:00Z"  # Start from scratch if no file

    with open(file_name, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for line in reversed(lines):  # Read file from the end
        if line.strip().startswith("2024-"):
            return line.strip()  # Return last recorded tweet timestamp

    return "2024-05-04T00:00:00Z"

# Get last recorded tweet date
last_tweet_date = get_last_tweet_date(output_file)
print(f"Resuming from last tweet date: {last_tweet_date}")

# API endpoint for tweets
url = f"https://api.twitter.com/2/users/{user_id}/tweets"

# Function to handle rate limits
def handle_rate_limit(response):
    """Handles Twitter API rate limits by waiting before retrying."""
    if response.status_code == 429:
        print("Rate limit reached. Waiting for 15 minutes before retrying...")
        time.sleep(900)  # Wait 15 minutes (Twitter's rate limit window)
        return True
    return False

# Query Parameters
params = {
    "tweet.fields": "created_at,text",
    "start_time": last_tweet_date,  # Resume from last recorded tweet
    "end_time": "2024-11-04T23:59:59Z",
    "max_results": 100  # Ensure max tweets per request
}

# Pagination loop to fetch all requested tweets
all_tweets = []
next_token = None

while True:
    if next_token:
        params["pagination_token"] = next_token  # Use pagination to get older tweets

    response = requests.get(url, headers=headers, params=params)
    
    if handle_rate_limit(response):  # Handle rate limits
        continue

    if response.status_code != 200:
        print(f"Error: {response.status_code} - {response.text}")
        break

    tweets = response.json()
    if "data" in tweets:
        all_tweets.extend(tweets["data"])
    else:
        print("No new tweets found.")
        break

    # Check if there is a next page
    next_token = tweets.get("meta", {}).get("next_token")
    if not next_token:
        break  # Stop when no more pages

# Append new tweets to the file
with open(output_file, "a", encoding="utf-8") as txtfile:
    for tweet in all_tweets:
        txtfile.write(f"{tweet['created_at']}\n{tweet['text']}\n\n")

print(f"Total new tweets retrieved: {len(all_tweets)}")
print(f"New tweets appended to {output_file}")
