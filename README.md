# WaveQ - Patient Queue Management System

A full-stack queue management system built for Malabar Hospital Kondotty.

## Tech Stack
- Next.js 14
- Postgres (Neon) + Prisma
- Pusher (Realtime)
- Twilio (SMS) - *Optional configuration*
- Tailwind CSS + shadcn/ui

## Prerequisites
- Node.js 18+
- PostgreSQL database
- Pusher Account

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file based on `.env` (already created).
   Fill in your Database URL and Pusher credentials.

3. **Database Setup**
   Push the schema to your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed Database** (Optional)
   You need at least one Doctor and User in the database to start.
   You can manually create them using Prisma Studio:
   ```bash
   npx prisma studio
   ```
   Or create a seed script.

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## Key Routes
- `/display` - Public Display Board (TV)
- `/dashboard` - Receptionist Dashboard
- `/token/[id]` - Patient Status Page

## Note on "npx"
If you are running on a system where `npx` is not available directly, ensure Node.js is installed correctly and fully operational.
