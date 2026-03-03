# Deployment Guide (Free Tier)

This application is architected to run perfectly on the free tiers of Vercel (Frontend) and Render (Backend + Database).

## 1. Setup PostgreSQL on Render
1. Create an account on [Render](https://render.com).
2. Click **New +** and select **PostgreSQL**.
3. Name your database (e.g., `placement-db`) and select the Free tier.
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (if deploying backend to Render) or **External Database URL** (for local testing).

## 2. Deploy Backend on Render
1. Push your code to a GitHub repository.
2. In Render, click **New +** and select **Web Service**.
3. Connect your GitHub account and select your repository.
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: Free
5. **Environment Variables**:
   - `DATABASE_URL`: Add the internal connection string from your Render PostgreSQL.
   - `JWT_SECRET`: Create a strong random string.
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
6. Click **Create Web Service**.

*Note: You must manually run your `database/schema.sql` via a GUI tool like pgAdmin or DBeaver using the External DB URL provided by Render.*

## 3. Deploy Frontend on Vercel
1. Create an account on [Vercel](https://vercel.com).
2. Click **Add New... -> Project**.
3. Import your GitHub repository.
4. Settings:
   - Framework Preset: React / Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: Use the **URL of your deployed Render Backend** (e.g., `https://placement-backend.onrender.com/api`).
6. Click **Deploy**.

🎉 **Your AI-powered Campus Placement Portal is now live!**
