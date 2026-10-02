# Mechanical Engineering Portal — MUST

A full-featured academic portal for the **Mechanical Engineering Department** at **Misr University for Science and Technology (MUST)**.

## Overview

This is a production-ready Progressive Web App (PWA) built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. It provides students with access to academic resources and gives administrators a complete content management system.

## Features

### Student-Facing
- 📊 **Dashboard** — Overview of tasks, deadlines, announcements, and events
- 📚 **Subjects** — Browse all active subjects with detailed pages
- ✅ **Tasks** — Assignments, quizzes, sheets, projects, and exams with deadline tracking
- 📂 **Materials** — PDFs, documents, presentations, YouTube videos, Google Drive links
- 📢 **Announcements** — Department announcements with priority levels
- 📅 **Calendar** — Academic events, exams, and important dates
- 🔍 **Search** — Global search across all content
- 📱 **PWA** — Installable as a mobile app

### Admin Panel
- 🔐 **Secure Login** — Supabase Auth with role-based access
- 💻 **Full CRUD** — Complete management for all content types
- 📤 **File Uploads** — Upload PDFs and documents directly to Supabase Storage
- 📎 **YouTube/Drive** — Link external video and document resources
- 👥 **Multi-Admin** — Manage multiple administrators
- 🔔 **Publish Control** — Draft/publish workflow for announcements

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui components |
| Backend | Next.js Server Actions, API Routes |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Hosting | Vercel |
| PWA | Web App Manifest + Service Worker |

## Project Structure

```
src/
├── actions/         # Server actions (CRUD operations)
├── app/
│   ├── (public)/    # Student-facing pages
│   ├── admin/       # Admin panel pages
│   └── api/         # API routes
├── components/
│   ├── admin/       # Admin-specific components
│   ├── layout/      # Navigation components
│   ├── providers/   # Context providers
│   └── ui/          # Reusable UI components
├── lib/
│   ├── supabase/    # Supabase clients
│   ├── deadline.ts  # Deadline calculation utility
│   ├── url-validator.ts
│   └── file-validator.ts
└── types/           # TypeScript type definitions
```

## Setup

### Prerequisites
- Node.js 18+
- A Supabase project
- (Optional) Vercel account for deployment

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/must-me-portal.git
   cd must-me-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up the database**
   - Go to your Supabase project → SQL Editor
   - Run the SQL from `supabase/migrations/001_initial_schema.sql`

5. **Set up Supabase Storage**
   - Create two storage buckets in Supabase:
     - `task-attachments` (public)
     - `materials` (public)

6. **Start development server**
   ```bash
   npm run dev
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) | ✅ |
| `NEXT_PUBLIC_APP_URL` | Application URL | Optional |

## Database Setup

Run the migration file in Supabase SQL Editor:
```bash
# File: supabase/migrations/001_initial_schema.sql
```

This creates:
- All tables with proper constraints
- Row Level Security (RLS) policies
- Triggers for `updated_at` timestamps
- Auto-profile creation on user signup
- Demo seed data (6 ME subjects)

## Creating the First Admin

1. Register a Supabase account through the Auth dashboard
2. Run this SQL in Supabase SQL Editor:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin@email.com';
   ```
3. Log in at `/admin/login`

## Development

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run lint       # Run ESLint
npm run type-check # TypeScript check
```

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step deployment instructions.

## Admin Guide

See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for instructions on managing portal content.

## License

MIT License. For educational use.
