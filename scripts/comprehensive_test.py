import requests
import time
import sys

BASE_URL = "http://localhost:8000"

def run_test(name, func):
    try:
        print(f"Testing {name}...", end=" ")
        func()
        print("✅ PASS")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_health():
    res = requests.get(f"{BASE_URL}/")
    assert res.status_code == 200
    assert "Online" in res.json()["status"]

def test_recognize_valid():
    # Using a known reel (short processing time preferred, but backend handles it)
    # Mocking or using a real one? Real one is better for integration.
    # User's reel: https://www.instagram.com/reels/DRca5dikocY/
    payload = {"url": "https://www.instagram.com/reels/DRca5dikocY/"}
    res = requests.post(f"{BASE_URL}/recognize", json=payload)
    if res.status_code != 200:
        raise Exception(f"Status {res.status_code}: {res.text}")
    data = res.json()
    assert data["success"] == True
    assert "track" in data
    assert "preview_url" in data # verifying our recent fix

def test_recognize_invalid_url():
    payload = {"url": "https://not-a-valid-url.com/xyz"}
    res = requests.post(f"{BASE_URL}/recognize", json=payload)
    # Should probably return 500 or error, but manageable
    # Our backend raises 500 for download fail
    assert res.status_code in [500, 422, 400]

if __name__ == "__main__":
    print("🧪 Starting System Verification Tests...")
    results = [
        run_test("Health Check", test_health),
        run_test("Recognition (Integration)", test_recognize_valid),
        run_test("Invalid URL Handling", test_recognize_invalid_url)
    ]
    
    if all(results):
        print("\n✨ All systems operational.")
        sys.exit(0)
    else:
        print("\n⚠️ Some tests failed.")
        sys.exit(1)
