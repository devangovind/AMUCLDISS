import requests
from dotenv import find_dotenv, load_dotenv
import os
from bs4 import BeautifulSoup


dotenv_path = find_dotenv()
load_dotenv(dotenv_path)
AI_API_KEY = os.getenv("AI_API_KEY")
AI_ENDPOINT = os.getenv("AI_ENDPOINT")

class BingSearch:
    def __init__(self):
        self.subscription_key = AI_API_KEY
        self.search_url = "https://api.bing.microsoft.com/v7.0/search"
    def search(self, company):
        headers = {"Ocp-Apim-Subscription-Key": self.subscription_key}
        params = {"q": f"{company} recent news", "textDecorations": True, "textFormat": "HTML"}
        response = requests.get(self.search_url, headers=headers, params=params)
        response.raise_for_status()
        search_results = response.json()
        results = search_results["webPages"]['value']
        res = []
        for result in results[:5]:
            response = requests.get(result['url'])
            soup = BeautifulSoup(response.content, 'html.parser')
            text = soup.find('body').get_text().strip()
            cleaned = " ".join(text.split('\n'))
            cleaned = " ".join(cleaned.split())
            res.append(cleaned)
            break
        return res



search = BingSearch()
print(search.search("Amazon"))