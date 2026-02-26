import requests
import json

url = "http://localhost:8000/recognize"
payload = {"url": "https://www.instagram.com/reels/DRca5dikocY/"}
headers = {'Content-Type': 'application/json'}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
