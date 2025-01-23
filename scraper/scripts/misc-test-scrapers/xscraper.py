from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time

# ChromeDriver setup with headless option
chrome_options = Options()
chrome_options.headless = False  # Set to True to run in headless mode
service = Service('/usr/local/bin/chromedriver-mac-x64/chromedriver')  # Replace with your actual path
driver = webdriver.Chrome(service=service, options=chrome_options)

# Function to scrape tweets from a specific user's profile
def scrape_tweets(username):
    # Navigate to the user's profile page
    url = f"https://twitter.com/{username}"
    driver.get(url)

    # Retry mechanism for loading tweets
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Try finding tweet articles with extended wait time
            WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, "//article[@role='article']"))
            )
            print("Tweets loaded successfully.")
            break
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: Tweets didn't load in time. Retrying...")
            time.sleep(5)  # Short wait before retrying
            driver.refresh()  # Refresh the page to try again
    else:
        print("Failed to load tweets after several attempts.")
        driver.quit()
        return

    # Scroll down to load more tweets
    scroll_pause = 2
    max_scrolls = 10  # Adjust the number of scrolls as needed
    last_height = driver.execute_script("return document.body.scrollHeight")

    for _ in range(max_scrolls):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(scroll_pause)

        # Check if more tweets have loaded
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            print("Reached the end of the page or no new tweets loaded.")
            break
        last_height = new_height

    # Parse page source with BeautifulSoup
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    tweets = soup.find_all('article', {'role': 'article'})

    # Extract and print the tweet content
    for tweet in tweets:
        tweet_content = tweet.get_text(separator=' ', strip=True)
        print(tweet_content)  # Print or save the content as needed

# Scrape tweets from the desired Twitter profile
scrape_tweets("KamalaHarris")

# Close the browser
driver.quit()
