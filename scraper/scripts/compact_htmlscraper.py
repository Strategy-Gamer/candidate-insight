import os
import sys
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from urllib.parse import urlparse
from datetime import datetime

def read_input_file(file_path):
    """Reads an input file of name/URL pairs and returns a list of tuples."""
    websites = []
    with open(file_path, 'r') as file:
        lines = [line.strip() for line in file if line.strip()]
        if len(lines) % 2 != 0:
            print("⚠️ Warning: Input file has an uneven number of lines.")
        for i in range(0, len(lines) - 1, 2):
            name = lines[i]
            url = lines[i + 1]
            websites.append((name, url))
    return websites

def extract_content(soup):
    """Extracts meaningful content from common readable tags."""
    content = ''
    for tag in ['article', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
        for element in soup.find_all(tag):
            line = element.get_text(separator=' ', strip=True)
            if len(line.split()) > 1:
                content += line + '\n'
    return content

def scrape_dynamic_website(url):
    """Scrapes only the top-level page content of a JavaScript-heavy site."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    service = Service('/usr/local/bin/chromedriver')  # Update if needed

    driver = webdriver.Chrome(service=service, options=chrome_options)
    try:
        print(f"Scraping {url}...")
        driver.get(url)
        time.sleep(3)
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        return extract_content(soup)
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return ""
    finally:
        driver.quit()

def append_to_combined_file(file_path, name, url, content):
    """Appends the scraped result to a combined text file."""
    with open(file_path, 'a', encoding='utf-8') as file:
        file.write("=" * 80 + "\n")
        file.write(f"{name}\n")
        file.write(f"URL: {url}\n")
        file.write(f"Scraped on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        file.write(content + "\n\n")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python htmlscraper.py <input_file>")
        sys.exit(1)

    input_path = sys.argv[1]
    combined_output = "combined_scrape.txt"

    # Clear any old content
    open(combined_output, 'w').close()

    websites = read_input_file(input_path)

    for name, url in websites:
        if not url or not url.startswith("http"):
            print(f"⚠️ Skipping invalid URL for: {name}")
            continue

        scraped = scrape_dynamic_website(url)

        if scraped:
            append_to_combined_file(combined_output, name, url, scraped)
            print(f"Appended content for: {name}")
        else:
            print(f"No content scraped for {name}")
