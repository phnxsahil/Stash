# How to Get Instagram Cookies for Stash

## Quick Guide

### Step 1: Install Browser Extension
1. Open Chrome/Edge
2. Install: [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)

### Step 2: Export Cookies
1. Go to https://instagram.com (make sure you're logged in)
2. Click the extension icon
3. Click "Export" → Copy the text

### Step 3: Add to Railway
1. Go to your Railway project
2. Click "Variables" tab
3. Add new variable:
   - **Name**: `YTDLP_COOKIES`
   - **Value**: Paste the entire cookie text
4. Click "Deploy"

### Step 4: Test
Wait 2-3 minutes for deployment, then try stashing an Instagram Reel!

---

## Alternative: Manual Cookie Export (Advanced)

If you don't want to use an extension:

1. Open Instagram in Chrome
2. Press F12 → Go to "Application" tab
3. Expand "Cookies" → Click "https://instagram.com"
4. Find these cookies and copy their values:
   - `sessionid`
   - `csrftoken`
   - `ds_user_id`

5. Create a file with this format:
```
# Netscape HTTP Cookie File
.instagram.com	TRUE	/	TRUE	0	sessionid	YOUR_SESSION_ID_HERE
.instagram.com	TRUE	/	TRUE	0	csrftoken	YOUR_CSRF_TOKEN_HERE
.instagram.com	TRUE	/	TRUE	0	ds_user_id	YOUR_USER_ID_HERE
```

6. Copy the entire content and paste into Railway's `YTDLP_COOKIES` variable

---

## Troubleshooting

**Cookies expire?**
- Re-export cookies every few weeks
- Instagram sessions typically last 90 days

**Still getting errors?**
- Make sure you're logged into Instagram in the browser
- Try logging out and back in, then re-export cookies
- Check Railway logs for specific error messages
