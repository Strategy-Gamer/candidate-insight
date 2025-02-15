import requests
import os

# Replace with your Bearer Token
BEARER_TOKEN = "YOUR_BEARER_TOKEN"

# Put in username 
USERNAME = "SamBrownForNV"

# API endpoint for user lookup
url = f"https://api.twitter.com/2/users/by/username/{USERNAME}"

# Headers
headers = {
    "Authorization": f"Bearer {BEARER_TOKEN}"
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

# Define the file name
output_file = "SamBrownNV.txt"

# Function to get last tweet date from the file
def get_last_tweet_date(file_name):
    if not os.path.exists(file_name):
        return None  # No existing file, start from scratch
    
    with open(file_name, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    # Read last tweet timestamp
    for line in reversed(lines):
        if line.strip().startswith("2024-"):
            return line.strip()  # Return last date found
    
    return None  # No timestamp found, start fresh

# Get last recorded tweet date
last_tweet_date = get_last_tweet_date(output_file)
if last_tweet_date:
    print(f"Resuming from last tweet date: {last_tweet_date}")
else:
    print("No existing tweets found, starting fresh.")
    last_tweet_date = "2024-05-04T00:00:00Z"

# API endpoint for tweets
url = f"https://api.twitter.com/2/users/{user_id}/tweets"

# Query Parameters
params = {
    "tweet.fields": "created_at,text",
    "start_time": last_tweet_date,  # Resume from last recorded tweet
    "end_time": "2024-11-04T23:59:59Z"
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

# Append new tweets to the file
with open(output_file, "a", encoding="utf-8") as txtfile:
    for tweet in all_tweets:
        txtfile.write(f"{tweet['created_at']}\n{tweet['text']}\n\n")

print(f"Total new tweets retrieved: {len(all_tweets)}")
print(f"New tweets appended to {output_file}")
