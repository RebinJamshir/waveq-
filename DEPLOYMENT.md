# Deploying WaveQ to Vercel

Since this is a Next.js application, the easiest way to deploy it is using Vercel.

## Prerequisites

1.  **GitHub Account**: You need a GitHub account to store your code.
2.  **Vercel Account**: You can sign up using your GitHub account at [vercel.com](https://vercel.com).
3.  **Neon Database**: Ensure you have a Neon project set up and the connection string ready.
4.  **Pusher Account**: Ensure you have a Pusher app created and credentials ready.

## Step-by-Step Deployment Guide

### 1. Push Code to GitHub

Since git is not currently available/configured in this environment's terminal, you will need to initialize the repository manually if you haven't already.

1.  Open your terminal/command prompt.
2.  Navigate to the project folder:
    ```bash
    cd C:\Users\rebin\.gemini\antigravity\scratch\waveq
    ```
3.  Initialize Git and commit the code:
    ```bash
    git init
    git add .
    git commit -m "Initial commit for WaveQ"
    ```
4.  Create a new repository on GitHub (e.g., `waveq-app`).
5.  Link your local repository to GitHub:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/waveq-app.git
    git branch -M main
    git push -u origin main
    ```

### 2. Deploy on Vercel

1.  Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the `waveq-app` repository you just created.
4.  In the **Configure Project** screen:

    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).
    *   **Build Command**: `next build` (default).
    *   **Install Command**: `npm install` (default).

5.  **Environment Variables**:
    You MUST add the following variables in the "Environment Variables" section. Copy these from your `.env` file or local configuration.

    | Key | Value Description |
    | :--- | :--- |
    | `DATABASE_URL` | Your Neon Postgres Connection String (e.g., `postgres://...`) |
    | `NEXTAUTH_SECRET` | A random string (generate one with `openssl rand -base64 32` or similar) |
    | `NEXTAUTH_URL` | Your production URL (e.g., `https://waveq-app.vercel.app`) |
    | `PUSHER_APP_ID` | From Pusher Dashboard |
    | `PUSHER_KEY` | From Pusher Dashboard |
    | `PUSHER_SECRET` | From Pusher Dashboard |
    | `PUSHER_CLUSTER` | From Pusher Dashboard (e.g., `ap2`) |
    | `NEXT_PUBLIC_PUSHER_KEY` | Same as `PUSHER_KEY` |
    | `NEXT_PUBLIC_PUSHER_CLUSTER` | Same as `PUSHER_CLUSTER` |
    | `TWILIO_ACCOUNT_SID` | (Optional) For SMS |
    | `TWILIO_AUTH_TOKEN` | (Optional) For SMS |
    | `TWILIO_PHONE_NUMBER` | (Optional) For SMS |

6.  Click **Deploy**.

### 3. Post-Deployment Setup

Once deployed, Vercel will build your application.

1.  **Database Migration**: The build process includes `prisma generate`, but you might need to push the schema to the production database if it hasn't been done.
    *   In your local terminal, run user `npx prisma db push` while your `.env` points to the production database URL.
    *   Alternatively, you can add a build step override in Vercel settings, but `prisma db push` locally is often safer for initial setup.

2.  **Verify**: Visit your new `.vercel.app` URL.

### Troubleshooting

*   **Database Connection Errors**: Ensure your Neon database allows connections from Vercel (0.0.0.0/0 is usually fine for serverless).
*   **Pusher Errors**: Verify the `NEXT_PUBLIC_` variables are set correctly so the client can connect.
