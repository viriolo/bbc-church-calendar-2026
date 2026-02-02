# Supabase Backend Setup (Optional)

This guide sets up persistent cloud storage for the calendar data.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Click **"New Project"**
4. Name: `bbc-church-calendar`
5. Choose region closest to Papua New Guinea (Singapore or Sydney)
6. Click **Create new project**

Wait ~2 minutes for provisioning.

---

## Step 2: Get API Keys

1. Go to Project Settings → API
2. Copy these values:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 3: Create Database Tables

Go to SQL Editor → New query. Run this SQL:

```sql
-- Enable Row Level Security
alter table auth.users enable row level security;

-- Ministries table
CREATE TABLE ministries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  lead_person TEXT,
  lead_user_id UUID REFERENCES auth.users(id),
  meeting_day TEXT,
  meeting_time TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  category TEXT NOT NULL,
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  pathway TEXT NOT NULL CHECK (pathway IN ('Witness', 'Bible', 'Care/Neighbour', 'Freedom & Justice')),
  scripture TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'confirmed', 'completed', 'cancelled')),
  lead_person TEXT,
  ministry_id UUID REFERENCES ministries(id),
  location TEXT DEFAULT 'Boroko Baptist Church',
  budget_estimated NUMERIC,
  budget_approved NUMERIC,
  budget_actual NUMERIC,
  sponsorship_needed BOOLEAN DEFAULT FALSE,
  confirmed_by UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  recurring_pattern TEXT,
  recurring_parent_id UUID REFERENCES events(id),
  is_exception BOOLEAN DEFAULT FALSE
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quarterly goals table
CREATE TABLE quarterly_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  goals TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'delayed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on tables
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_goals ENABLE ROW LEVEL SECURITY;

-- Policies for ministries (public read, admin write)
CREATE POLICY "Ministries are viewable by everyone" 
  ON ministries FOR SELECT USING (true);

CREATE POLICY "Ministries are editable by authenticated users" 
  ON ministries FOR ALL USING (auth.role() = 'authenticated');

-- Policies for events
CREATE POLICY "Events are viewable by everyone" 
  ON events FOR SELECT USING (true);

CREATE POLICY "Events are editable by authenticated users" 
  ON events FOR ALL USING (auth.role() = 'authenticated');

-- Policies for comments
CREATE POLICY "Comments are viewable by everyone" 
  ON comments FOR SELECT USING (true);

CREATE POLICY "Comments are editable by authenticated users" 
  ON comments FOR ALL USING (auth.role() = 'authenticated');
```

---

## Step 4: Set Environment Variables in Netlify

1. In Netlify dashboard → Site settings → Environment variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key

---

## Step 5: Update Code to Use Supabase

Replace `src/store/calendar-store.ts` with Supabase version (see templates in repo).

---

## Step 6: Add Authentication (Optional)

Enable providers in Supabase:
1. Authentication → Providers
2. Enable Email, Google, etc.

---

## Step 7: Deploy

```bash
git add .
git commit -m "Add Supabase backend"
git push
# Netlify auto-deploys!
```

---

## Need Help?

- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Next.js + Supabase: [supabase.com/docs/guides/getting-started/quickstarts/nextjs](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
