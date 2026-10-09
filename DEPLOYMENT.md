# Deployment Guide — PortGuard AI

This guide walks you through deploying **PortGuard AI** with:
- **Backend (Express + Node.js)** on [Render](https://render.com)
- **Database (MongoDB)** on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free Cloud Cluster)
- **Frontend (React + Vite)** on [Vercel](https://vercel.com)

---

## Step 1: Set Up MongoDB Atlas (Cloud Database)

Since Render is a cloud platform, you need a cloud-hosted MongoDB connection string:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in/register (free).
2. Create a free shared cluster (**M0 Free**).
3. Under **Security ➔ Database Access**, create a user with a password (e.g. `portguard-user` and a strong password).
4. Under **Security ➔ Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render can connect.
5. In your cluster dashboard, click **Connect ➔ Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/portguard?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with the credentials you created).*

---

## Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + ➔ Web Service**.
2. Connect your GitHub repository: `pavanilingam11-tech/PortGuard-Ai`.
3. Fill in the following configuration:
   - **Name**: `portguard-ai-backend` (or your preferred name)
   - **Region**: Choose the closest region (e.g., Oregon or Frankfurt)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Expand **Environment Variables** and add:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `<Your MongoDB Atlas Connection String from Step 1>`
   - `CLIENT_URL` = `https://<your-vercel-app-name>.vercel.app` *(you can set this to `*` or update it after Vercel deployment)*
   - `AI_PROVIDER` = `mock` *(or add your `AI_API_KEY` for Google Gemini)*
5. Click **Create Web Service**.
6. Once deployed, Render will provide your public backend URL, for example:
   ```
   https://portguard-ai-backend.onrender.com
   ```
   *(Test that `https://portguard-ai-backend.onrender.com/health` returns `{"status":"ok"}`).*

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... ➔ Project**.
2. Import the `pavanilingam11-tech/PortGuard-Ai` GitHub repository.
3. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select **`client`**
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://portguard-ai-backend.onrender.com` *(use your actual Render backend URL from Step 2, without a trailing slash)*
5. Click **Deploy**.
6. Vercel will build the frontend and provide your production URL (e.g. `https://portguard-ai.vercel.app`).

---

## Step 4: Final Link Check

1. Return to your Render backend service settings.
2. Ensure `CLIENT_URL` environment variable matches your Vercel URL (e.g. `https://portguard-ai.vercel.app`).
3. Open your Vercel URL in your browser:
   - The **Security Dashboard** will load with live statistics from MongoDB Atlas.
   - Run a new assessment using the Hackathon sample or upload a CSV scan.
   - Test PDF and CSV report exports.
