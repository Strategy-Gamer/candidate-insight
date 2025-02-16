## X Bearer Token 
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAGk1xQEAAAAAR11kwjbQGZHWaBYL4cHuXnTSfBs%3DXNPn2guqqztAq1MEqWhJ18TnSPafCnIO2pfyBGB7ykpN4smWPL"

## AI Disclosure
ChatGPT was queried to understand how to utilize the Beautiful Soup and Selenium libraries better. It was also queried to understand X's API endpoints to ensure I did not completely run through my 15k post requests/mo without collecting quality data.

## scraper.py
A prototype of html-scraper. Doesn't take in a file; tested on one website. 

## fbscraper.py
Facebook's API doesn't seem to be public. I keep getting authentication errors. 

## TruthBrush
Appears to be deprecated. truthsocial.com/api no longer exists which is required for this toolbox. Also receiving authentication errors. 

## xscraper.py 
An attempt to scrape X without access to their API directly in an attempt to minimize costs. Authentication errors. 

## x2scraper.py
- Iteration 1: Collected last 7 days of tweets up to 100 tweets from Kamala Harris's account
- Iteration 2: Collected last 100 tweets from Nov 4, 2024 working backwards. Due to the rate limiter of 100, I only collected up to August, but the goal is May 4, 2024 (6 months before the election)
- Iteration 3: Changing "w(rite)" to "a(ppend)" and added code to send another request and continue appending from the last recorded date. Results: That doesn't work. In order to try to continue from the last recorded date, the way I have it coded now tries to request up to 8-24-2024 first so it results in "too many requests". 
- Iteration 4: Adding a sleep time to deal with rate limit.
