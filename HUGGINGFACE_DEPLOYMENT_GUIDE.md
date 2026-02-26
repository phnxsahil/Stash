# Deploying to Hugging Face Spaces (100% Free, No Credit Card)

Since Render, Railway, and Fly.io now ask for a credit card to prevent abuse, the best completely free alternative that supports Docker (which we need for `ffmpeg` to process songs) is **Hugging Face Spaces**. 

Hugging Face gives you a generous 2 vCPU and 16GB RAM for free, forever, with no credit card required.

## Step-by-Step Guide:

### 1. Create an Account
1. Go to [huggingface.co/join](https://huggingface.co/join) and create a free account.
2. Verify your email address.

### 2. Create a New Space
1. Go to your profile at the top right and click **New Space** (or go to [huggingface.co/new-space](https://huggingface.co/new-space)).
2. Name your space (e.g., `stash-api`).
3. For **License**, select `MIT`.
4. For **Select the Space SDK**, choose **Docker** and then select **Blank**.
5. Keep "Public" selected (or Private, up to you).
6. Click **Create Space**.

### 3. Upload Your Files
Your Space is essentially a Git repository. You need to upload your backend files to it. You don't need the frontend files (like `src/` or `package.json`), just the files the backend needs.

Upload the following files/folders directly in your browser by clicking **Files** -> **Add file** -> **Upload files**:

- `api/` (upload the entire folder containing `index.py` and `config.py`)
- `main.py`
- `requirements.backend.txt`
- `Dockerfile`

*(Wait, Hugging Face needs port 7860. Your `main.py` already checks for `os.environ.get("PORT")`, and Hugging Face passes `PORT=7860` automatically, so it will work perfectly out of the box!)*

### 4. Setup Environment Variables (Secrets)
Hugging Face calls environment variables "Secrets".
1. Click on the **Settings** gear icon in your Space.
2. Scroll down to **Variables and secrets**.
3. Under **Secrets**, click **New secret** and add your credentials one by one:
   - Name: `SPOTIFY_CLIENT_ID` | Value: `your_spotify_client_id`
   - Name: `SPOTIFY_CLIENT_SECRET` | Value: `your_spotify_client_secret`
   - Name: `GEMINI_API_KEY` | Value: `your_gemini_api_key`
   - Name: `YTDLP_COOKIES` | Value: `your_instagram_cookies` (if you have them)

4. Under **Variables**, click **New variable** and add your regular settings:
   - Name: `RATE_LIMIT_PER_DAY` | Value: `10`
   - Name: `ENABLE_DEBUG_LOGS` | Value: `false`
   - Name: `ENVIRONMENT` | Value: `production`
   - Name: `ALLOWED_ORIGINS` | Value: `https://stashyourmusic.vercel.app,http://localhost:5173`

### 5. Start the Server and Get the URL
1. As soon as you upload the files and set the variables, the server will "Build" using your `Dockerfile`.
2. Wait a minute or two for the status at the top to change from `Building` to `Running`.
3. Click the **three dots `...`** at the top right of your Space and select **Embed this Space**. 
4. Under the "Direct URL" section, you'll see a link like `https://yourusername-stash-api.hf.space`. 

Copy this URL, go to your Vercel Dashboard for the frontend, and update `VITE_API_URL` to point to it!
