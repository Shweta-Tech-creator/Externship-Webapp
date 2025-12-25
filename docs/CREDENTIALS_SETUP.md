# Credentials & Accounts Setup Guide

This guide provides detailed steps on how to create new accounts for the services used in this project and replace the existing credentials with your own.

---

## 1. MongoDB Atlas (Database)

### Step 1: Create an Account
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Sign up for a free account.

### Step 2: Create a Cluster
1. Once logged in, click **"Create"** (or "Build a Cluster").
2. Choose the **M0 (FREE)** tier.
3. Select a cloud provider (e.g., AWS) and a region (e.g., Mumbai, N. Virginia).
4. Click **"Create Deployment"**.

### Step 3: Security & Access
1. **Database User**: Create a user with a username and a **strong password**. Make sure to save these (they will be part of your `MONGO_URL`). Use "Built-in Role": `Read and write to any database`.
2. **Network Access**: Go to **Network Access** → **Add IP Address** → Click **"Allow Access from Anywhere"** (IP: `0.0.0.0/0`) → **Confirm**. 
   > [!NOTE]
   > Allowing access from anywhere is easiest for development, but for production, you should only allow your server's IP.

### Step 4: Get Connection String
1. Go to **Database** → **Connect**.
2. Select **"Drivers"** (or "Connect your application").
3. Copy the URI. It will look like this:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
4. Replace `<password>` with your actual database user password.
5. In your project, replace the `MONGO_URL` in your `.env` file with this string.

---

## 2. Cloudinary (Image Storage)

### Step 1: Create an Account
1. Visit [Cloudinary](https://cloudinary.com/signup).
2. Sign up and verify your email.

### Step 2: Get Credentials
1. Log in to your Cloudinary Dashboard.
2. In the **"Product Environment Settings"** or top right of the dashboard, you will find:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Replace the following in your `.env` file:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

---

## 3. Google Cloud (Authentication)

### Step 1: Create a Project
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** → **New Project**. Name it (e.g., "Externship Webapp").

### Step 2: Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**.
2. Select **External** → **Create**.
3. Fill in the required fields (App name, support email, developer contact info).
4. Add scopes like `./auth/userinfo.email` and `./auth/userinfo.profile`.
5. Continue to the dashboard.

### Step 3: Create Credentials
1. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
2. Application type: **Web application**.
3. **Authorized JavaScript origins**: 
   - `http://localhost:5173`
   - (And your production URL if deployed)
4. **Authorized redirect URIs**:
   - `http://localhost:5001/api/auth/oauth/google/callback`
   - `https://externship-api.onrender.com/api/auth/oauth/google/callback` (Replace with your actual backend URL)
5. Click **Create** and copy the **Client ID** and **Client Secret**.

### Step 4: Update ENV
1. Replace in your backend and frontend `.env` files:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

---

## 4. Applying Changes Locally

1. Open your `frontend/.env` file.
2. Replace all the relevant keys with your new values.
3. Restart your dev servers (`npm run dev`).

## 5. Verifying the Setup

After you have updated your `.env` files and restarted your servers, you can perform these quick checks to ensure everything is working correctly:

### Database (MongoDB)
- **Check Connections**: In MongoDB Atlas, go to **Deployment** → **Database** and see if the "Connections" count increases when you start your server.
- **Check Data**: After performing an action in your app (like registering a user or saving an internship), go to **Browse Collections** in Atlas to see if the new data appears there.

### Cloudinary (Images)
- **Upload a Profile Picture**: Try updating a profile picture in your application.
- **Check Media Library**: Log in to Cloudinary and go to the **Media Library**. You should see the newly uploaded image there.

### Google Login
- **Test Login**: Try logging in using the "Login with Google" button.
- **Check Redirects**: If you get a "redirect_uri_mismatch" error, ensure that the URI shown in the error message exactly matches one of the URIs you added in the Google Cloud Console.

---

### Need Help?
If you run into any errors while updating these values, please provide the error message here and I will help you debug it!
