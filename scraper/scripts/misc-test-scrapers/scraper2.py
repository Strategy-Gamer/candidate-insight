import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

# Set of visited URLs to avoid revisiting the same page
visited_urls = set()

# Ensure the output directory exists
os.makedirs('scraped_pages', exist_ok=True)

def scrape_page(url):
    if url in visited_urls:
        return  # We've already scraped this page

    # Add the URL to the visited set
    visited_urls.add(url)
    
    # Step 1: Fetch the page
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve: {url}")
        return

    # Step 2: Parse the page content
    soup = BeautifulSoup(response.text, 'html.parser')

    # Step 3: Extract all text
    all_text = soup.find_all(string=True)  # Use string=True instead of text=True
    filtered_text = [text for text in all_text if text.parent.name not in ['script', 'style', 'meta', '[document]']]
    page_text = '\n\n'.join(filtered_text).strip()

    # Step 4: Print or save the text
    print(f"Scraped content from {url}")
    filename = f'scraped_pages/{urlparse(url).path.replace("/", "_")}.txt'
    with open(filename, 'w') as file:
        file.write(page_text)

    # Step 5: Find all internal links
    internal_links = set()
    for link in soup.find_all('a', href=True):
        href = link['href']
        full_url = urljoin(url, href)  # Resolve relative URLs
        # Ensure we only follow internal links (same domain)
        if is_internal_link(full_url):
            internal_links.add(full_url)

    # Step 6: Recursively scrape internal links
    for link in internal_links:
        scrape_page(link)

def is_internal_link(url):
    """ Check if the link is internal to the domain """
    parsed_url = urlparse(url)
    return parsed_url.netloc == "kamalaharris.com" or parsed_url.netloc == "www.kamalaharris.com"

# Start scraping from the homepage
scrape_page('https://kamalaharris.com')
