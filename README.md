# StockSEO AI – Adobe Stock Keyword Generator

Full-stack SaaS Chrome Extension to generate SEO-optimized titles and keywords for Adobe Stock.

## Features
- Google OAuth Login
- AI-powered Title & Keyword generation (Gemini 2.0 Flash)
- Daily usage limits (20 generations for free users)
- Copy to Clipboard & Download CSV
- Clean modern UI

## Setup Instructions

### 1. Backend Setup
1. Navigate to the `backend` folder.
2. Run `npm install`.
3. Create a `.env` file based on `.env.example`.
4. Fill in your credentials:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A random secret string.
   - `GOOGLE_CLIENT_ID`: From Google Cloud Console.
   - `GEMINI_API_KEY`: From Google AI Studio.
5. Run `node server.js` to start.

### 2. Chrome Extension Setup
1. Open Chrome and go to `chrome://extensions/`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `extension` folder.
4. Update `BACKEND_URL` in `background.js`, `popup.js`, and `content.js` if deploying.
5. Update `clientId` in `background.js`.

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Setup OAuth consent screen (Internal or External).
4. Go to Credentials -> Create Credentials -> OAuth client ID.
5. Select "Chrome app" and enter your Extension ID (found on `chrome://extensions/` page).
6. Copy the Client ID to your `.env` and `background.js`.

## Tech Stack
- **Extension**: Manifest V3, Vanilla JS/CSS
- **Backend**: Node.js, Express, MongoDB
- **AI**: Google Gemini API
- **Auth**: Google OAuth 2.0, JWT
