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
(Edit 2-15-2024: Deleting xscraper.py)

## x2scraper.py
- Iteration 1: Collected last 7 days of tweets up to 100 tweets from Kamala Harris's account
- Iteration 2: Collected last 100 tweets from Nov 4, 2024 working backwards. Due to the rate limiter of 100, I only collected up to August, but the goal is May 4, 2024 (6 months before the election)
- Iteration 3: Changing "w(rite)" to "a(ppend)" and added code to send another request and continue appending from the last recorded date. Results: That doesn't work. In order to try to continue from the last recorded date, the way I have it coded now tries to request up to 8-24-2024 first so it results in "too many requests". 
- Iteration 4: Adding a sleep time to deal with rate limit. That somehow preformed worse. It didn't even acknowledge there were tweets beyond 8-24-2024. 
- Iteration 5: Back to iteration 2, and I'm going to do every collection manually. I will change about iteration 2 is changing "w(rite)" to "a(ppend)" and add a date/time stamp to the output file. FINAL ITERATION. COPYING TO X-scraper.py 

## X-Scraper.py
The scraper this project used for X.com. 

## htmlscraper.py
Can scrape several layers of a site. Was used primarly to scrape candidate sites as there were several redirects.

# Other Notes
- I scraped sites that had quotes from 2+ candidates a separate time for each candidate for the ease of the NLP. Ideally, in future iterations, we will not need to do this to preserve space in our database and the NLP will be able to categorize candidates on its own.
- For future iterations, we would also like to include news articles and the like to expand our breadth of scraping and only collect words that in quotations from the relevant candidate. 
- Some candidates were lacking in transcripts so I scraped more X posts in lieu of that and/or decided to transcribe the videos myself with the Whisper library for Python. Our original goal was not to use AI to transcribe due to AI bias, but have determined it would be far more biased to have more information for a candidate's opponent than the candidate themselves due to lack of resources. 

# Similar Sites
- The American Presidency Project by the University of California, Santa Barbara
- Ballotpedia
- OnTheIssues.org
- govtrack.us




