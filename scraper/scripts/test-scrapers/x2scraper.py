import requests
import csv

# Replace with your Bearer Token
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAGk1xQEAAAAAX4VB49FO7a2z9JnBx8Ijf5tu7x4%3D2sX3Vhmxa8Q0zDPgl5GQQPvi0fNiqOMlWCMEkU5H7hHiNJU0ef"

# Put in username 
USERNAME = "SamBrownForNV"
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

# Save formatted tweets to a plain text file
with open("SamBrownNV.txt", "w", encoding="utf-8") as txtfile:
    for tweet in all_tweets:
        txtfile.write(f"{tweet['created_at']}\n{tweet['text']}\n\n")

print(f"Total tweets retrieved: {len(all_tweets)}")
print("Tweets saved to SamBrownNV.txt")
