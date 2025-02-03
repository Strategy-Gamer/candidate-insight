import requests
from bs4 import BeautifulSoup

# Send a request to the website
url = 'https://www.facebook.com/KamalaHarris/'
response = requests.get(url)

# Error check
if response.status_code == 200:
    print("Successfully fetched the webpage")
else:
    print(f"Failed to retrieve the page. Status code: {response.status_code}")
    exit()

# Parse the HTML content using BeautifulSoup
soup = BeautifulSoup(response.text, 'html.parser')

# Extract relevant text content
# Target <p> and <h1>-<h3> tags, and optionally adjust based on website structure
text_elements = soup.find_all(['p', 'h1', 'h2', 'h3'])

# Clean and filter the text
# We will strip extra spaces/newlines and remove empty elements
filtered_text = [element.get_text().strip() for element in text_elements if element.get_text().strip()]

# Join the text with newlines between paragraphs/headings
cleaned_text = '\n\n'.join(filtered_text)

# Save the cleaned text to a file
with open('kamalaharris_text.txt', 'w') as file:
    file.write(cleaned_text)

print("Text content has been saved to kamalaharris_text.txt")
