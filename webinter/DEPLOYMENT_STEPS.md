# Quick Deployment Steps for Render

## Step 1: Push to GitHub

```bash
# Open terminal in your project folder
cd "c:\Users\SAI KUMAR\OneDrive\Desktop\webinter"

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create repository on GitHub first, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 2: Deploy Backend on Render

1. Go to https://render.com and sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `internship-backend` (or any name you want)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: `Free`
5. Click "Create Web Service"
6. **IMPORTANT**: Copy the backend URL (e.g., `https://internship-backend.onrender.com`)

## Step 3: Update Frontend API URL

After backend is deployed, update the API URL in your frontend:

1. Open `client/src/api.js`
2. Change line 4 from:
   ```javascript
   baseURL: 'http://127.0.0.1:3000/api',
   ```
   to:
   ```javascript
   baseURL: 'https://YOUR-BACKEND-URL.onrender.com/api',
   ```
   (Replace `YOUR-BACKEND-URL` with the actual URL from Step 2)

3. Commit and push:
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push
   ```

## Step 4: Deploy Frontend on Render

1. In Render dashboard, click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name**: `internship-frontend` (or any name you want)
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Click "Create Static Site"

## Step 5: Access Your App

Your app will be live at: `https://YOUR-FRONTEND-NAME.onrender.com`

### Important Notes:
- First load might take 30-60 seconds (free tier limitation)
- Backend sleeps after 15 minutes of inactivity
- Database is stored on the backend server (SQLite file)
- Default login: `admin` / `admin123`

That's it! Your Internship Management System is now live! 🚀
