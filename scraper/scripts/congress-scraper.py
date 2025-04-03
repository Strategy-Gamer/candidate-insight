import requests
import re
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from datetime import datetime
import os

API_KEY = 'Z1fkVGn23EU6gI5xwNvBf3sMRblSdL315mlzlDyd'  
BASE_URL = 'https://api.congress.gov/v3/'
INPUT_FILE = '../source-txt/congress-sites.txt' 

def normalize_name(name):
    """Lowercase, strip punctuation, split into words"""
    return re.findall(r'\b\w+\b', name.lower())


def get_member_info(member_name):
    """Fuzzy-match a name against Congress members"""
    members = []
    endpoint = f"{BASE_URL}member/current"
    params = {
        'api_key': API_KEY,
        'format': 'json',
        'limit': 250
    }

    while endpoint:
        print(f"📡 Requesting: {endpoint} with params: {params}")
        res = requests.get(endpoint, params=params)
        res.raise_for_status()
        data = res.json()
        members.extend(data.get("members", []))

        # Handle pagination and reattach API key
        next_url = data.get("pagination", {}).get("next", None)
        if not next_url:
            break
        parsed = urlparse(next_url)
        query = parse_qs(parsed.query)
        query["api_key"] = [API_KEY]
        new_query = urlencode(query, doseq=True)
        endpoint = urlunparse(parsed._replace(query=new_query))
        params = {}

    # Fuzzy match by comparing cleaned word sets
    target_parts = normalize_name(member_name)

    for member in members:
        full_name_parts = normalize_name(member.get("fullName", ""))
        if all(part in full_name_parts for part in target_parts):
            return {
                "bioguideId": member.get("bioguideId"),
                "state": member.get("state"),
                "chamber": member.get("chamber"),
                "fullName": member.get("fullName")
            }

    return None


def get_member_bills(bioguide_id):
    """Get all bills for a member using their bioguideId"""
    bills = []
    endpoint = f"{BASE_URL}member/{bioguide_id}/bills"
    params = {
        'api_key': API_KEY,
        'format': 'json',
        'limit': 250
    }

    while endpoint:
        res = requests.get(endpoint, params=params)
        res.raise_for_status()
        data = res.json()
        bills.extend(data.get('bills', []))
        endpoint = data.get('pagination', {}).get('next', None)
        params = {}  # only for first call

    return bills


def clean_filename(name):
    """Remove characters that are invalid in file names"""
    return re.sub(r'[\\/:"*?<>|]+', '', name)


def save_bills_text(member_info, bills):
    """Write a clean .txt file for one member"""
    name = member_info["fullName"]
    state = member_info["state"]
    chamber = member_info["chamber"].capitalize()

    filename = clean_filename(f"{name} {state} Congress {chamber}.txt")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(f"Bills for {name} ({state}) - {chamber} of Congress\nGenerated: {datetime.now()}\n\n")
        for bill in bills:
            number = bill.get('number')
            title = bill.get('title', '').strip()
            congress = bill.get('congress')
            bill_type = bill.get('type')
            url = bill.get('url')

            f.write(f"{number} ({bill_type}) - {title}\n")
            f.write(f"Congress: {congress} | URL: {url}\n\n")

    print(f"✅ Saved {len(bills)} bills → {filename}")


def main():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ File '{INPUT_FILE}' not found.")
        return

    with open(INPUT_FILE, 'r', encoding='utf-8') as file:
        names = [line.strip() for line in file if line.strip()]

    for name in names:
        print(f"\n🔍 Processing: {name}")
        try:
            info = get_member_info(name)
            if not info:
                print(f"❌ Could not find member info for '{name}'")
                continue

            bills = get_member_bills(info['bioguideId'])
            if not bills:
                print(f"⚠️ No bills found for {name}")
                continue

            save_bills_text(info, bills)

        except Exception as e:
            print(f"❌ Error with {name}: {e}")


if __name__ == '__main__':
    main()
