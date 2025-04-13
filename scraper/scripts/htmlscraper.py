import os
import sys
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from urllib.parse import urljoin, urlparse
from datetime import datetime
import time

def read_input_file(file_path):
    """Reads the input file and returns a list of (name, URL) tuples."""
    websites = []
    with open(file_path, 'r') as file:
        lines = file.readlines()
        for i in range(0, len(lines), 2):
            name = lines[i].strip()
            url = lines[i + 1].strip()
            websites.append((name, url))
    return websites

def extract_content(soup):
    """Extract meaningful content from specific tags, ignoring short lines."""
    content = ''
    for tag in ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'article']:
        for element in soup.find_all(tag):
            line = element.get_text(separator=' ', strip=True)
            # if len(line.split()) > 3:  # Include only lines with more than 3 words
            #     content += line + '\n'
    return content

## Scrapes a JavaScript-heavy website and its subpages up to a certain depth.
def scrape_dynamic_website(url, visited=set(), max_depth=1, depth=0):
    """
    Scrapes a JavaScript-heavy website and its subpages up to a certain depth.
    """
    if depth > max_depth or url in visited:
        return ""

    # Set up Selenium WebDriver
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode (no GUI)
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    service = Service('/usr/local/bin/chromedriver')  # Update path to your WebDriver

    driver = webdriver.Chrome(service=service, options=chrome_options)
    try:
        # Visit the page
        print(f"Scraping {url} at depth {depth}...")
        driver.get(url)
        time.sleep(3)  # Allow time for JavaScript to load

        # Mark URL as visited
        visited.add(url)

        # Extract content
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        content = extract_content(soup)

        # Find and crawl subpages
        for link in soup.find_all('a', href=True):
            sub_url = urljoin(url, link['href'])
            if sub_url not in visited and urlparse(sub_url).netloc == urlparse(url).netloc:
                content += scrape_dynamic_website(sub_url, visited, max_depth, depth + 1)

        return content
    finally:
        driver.quit()

def write_output_file(output_name, name, scraped_content):
    """Writes the scraped content to an output file."""
    with open(output_name, 'w', encoding='utf-8') as file:
        file.write(f"Scraped on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        file.write(f"Website: {name}\n\n")
        file.write(scraped_content)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <input_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    websites = read_input_file(input_file)

    for name, url in websites:
        output_file_name = f"{name.replace(' ', '_').lower()}.txt"
        print(f"Scraping {name} ({url})...")
        scraped_content = scrape_dynamic_website(url)
        if scraped_content:
            write_output_file(output_file_name, name, scraped_content)
            print(f"Saved scraped content to {output_file_name}")
        else:
            print(f"Failed to scrape content for {name} ({url})")
