# ---------------------------------------------------------------------------- #
#                 HS scraper: house.gov and senate.gov scraper                 #
# ---------------------------------------------------------------------------- #
import os
import sys
import re
import time
from bs4 import BeautifulSoup
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from urllib.parse import urljoin, urlparse
from datetime import datetime

# Change as needed based on usage. 
MAX_DEPTH = 5 # Maximum depth for crawling subpages

# To scrape only the most relevant pages
KEYWORDS = [
    "policy", "issues", "support", "oppose", "bill",
    "platform", "priorities", "legislation", "agenda", "plans", "reform", "vote"
]


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
    """Extracts meaningful content by focusing on main content areas."""
    content = ''

    # Try to find the main block first
    main = soup.find('main') or soup.find('div', id='main-content') or soup.find('div', role='main')
    search_area = main if main else soup  # fallback to full page

    # Scrape text from main content area
    for tag in ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'article']:
        for element in search_area.find_all(tag):
            line = element.get_text(separator=' ', strip=True)
            if line:  
                content += line + '\n'
    
    # Scrape tables 
    for table in search_area.find_all('table'):
        for row in table.find_all('tr'):
            row_text = []
            for cell in row.find_all(['td', 'th']):
                cell_text = cell.get_text(separator=' ', strip=True)
                if cell_text:
                    row_text.append(cell_text)
            if row_text:
                content += ' | '.join(row_text) + '\n'
    
    return content

def create_driver():
    """Creates an undetected Chrome driver instance."""
    options = uc.ChromeOptions()
    # options.add_argument("--headless=new") 
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--remote-debugging-port=9222")
    driver = uc.Chrome(options=options)
    return driver

def scrape_dynamic_website(url, visited=None, max_depth=MAX_DEPTH, depth=0):
    """Scrapes a JavaScript-heavy website and subpages up to max_depth."""
    if visited is None:
        visited = set()

    if depth > max_depth or url in visited:
        return ""

    driver = create_driver()

    try:
        print(f"Scraping {url} at depth {depth}...")
        driver.set_page_load_timeout(30)
        driver.get(url)
        time.sleep(7)  # Allow JavaScript content to load

        visited.add(url)
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        content = extract_content(soup)

        # Crawl internal subpages
        for link in soup.find_all('a', href=True):
            sub_url = urljoin(url, link['href'])
            sub_url_lower = sub_url.lower()

            if sub_url not in visited and urlparse(sub_url).netloc == urlparse(url).netloc:
                if any(keyword in sub_url_lower for keyword in KEYWORDS):
                    try:
                        content += scrape_dynamic_website(sub_url, visited, max_depth, depth + 1)
                    except Exception as e:
                        print(f"⚠️ Skipping subpage {sub_url} due to error: {e}")
                        continue
                else:
                    print(f"Skipping irrelevant page: {sub_url}")

        return content
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None
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
        print("Usage: python htmlscraper.py <input_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    websites = read_input_file(input_file)

    for name, url in websites:
        safe_name = re.sub(r'[\\/*?:"<>|]', '', name)
        output_file_name = f"{safe_name.replace(' ', '_').lower()}.txt"

        print(f"\nScraping {name} ({url})...")
        scraped_content = scrape_dynamic_website(url)

        if scraped_content is not None and scraped_content.strip():
            write_output_file(output_file_name, name, scraped_content)
            print(f"Saved: {output_file_name}")
        else:
            print(f"Failed to scrape content for {name} ({url})")
