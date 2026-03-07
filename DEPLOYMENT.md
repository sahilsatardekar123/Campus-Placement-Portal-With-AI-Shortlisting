# Live Deployment Guide (Completely Free Tier)

This application is architected to run perfectly on the free tiers of **Vercel** (Frontend) and **Render** (Backend). Because you are already using MongoDB Atlas (Database), Cloudinary (PDF Resumes), and Groq (AI processing) on free tiers, **hosting this project will literally cost $0.00**.

Follow these exact steps to go live:

---

## 1. Deploy the Backend on Render
Render will host your Node.js API server 24/7 for free.

1. Go to [Render](https://render.com) and sign in with GitHub.
2. Click **New +** in the top right, and select **Web Service**.
3. Choose **Build and deploy from a Git repository**.
4. Connect your GitHub account and select this `Campus-Placement-Portal-With-AI-Shortlisting` repository.
5. Enter the following settings:
   - **Name**: `placement-backend` (or similar)
   - **Root Directory**: `backend` *(Crucial!)*
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
6. Scroll down to **Environment Variables** and click *Add Environment Variable*. Copy everything from your local `backend/.env` file exactly as it is:
   - `MONGO_URI`: (Your MongoDB compass connection string)
   - `JWT_SECRET`: (Your secret token)
   - `CLOUDINARY_CLOUD_NAME`: (Your cloudinary name)
   - `CLOUDINARY_API_KEY`: (Your cloudinary key)
   - `CLOUDINARY_API_SECRET`: (Your cloudinary secret)
   - `GROQ_API_KEY`: (Your groq key)
7. Click **Create Web Service**. 
8. Render will now build it. Wait 1-2 minutes. Once it says "Live", look near the top for your new live URL (e.g., `https://placement-backend-abcd.onrender.com`). **Copy this URL**.

---

## 2. Deploy the Frontend on Vercel
Vercel is the creator of Next.js but hosts React/Vite projects flawlessly on their lightning-fast free tier.

1. Go to [Vercel](https://vercel.com) and sign in with GitHub.
2. Click **Add New... -> Project**.
3. Import your `Campus-Placement-Portal-With-AI-Shortlisting` repository.
4. Enter the following settings:
   - **Project Name**: `placement-portal` (or similar)
   - **Framework Preset**: `Vite` (Should auto-detect)
   - **Root Directory**: Click "Edit" and choose `frontend` *(Crucial!)*
5. Expand the **Environment Variables** section. Add exactly one variable here:
   - **Name**: `VITE_API_URL`
   - **Value**: `[PASTE THE RENDER URL HERE]/api` *(Example: `https://placement-backend-abcd.onrender.com/api`)*
6. Click **Deploy**.
7. Wait 30 seconds for the React app to build. 

---

## 🎉 You're Live!

Vercel will give you a live `.vercel.app` URL (or you can attach a custom domain). 
Click that link, create an account, and experience your AI Placement Portal live on the internet!
