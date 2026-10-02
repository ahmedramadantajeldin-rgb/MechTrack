-- ============================================================
-- MUST Mechanical Engineering Portal — Initial Database Schema
-- Version: 1.0.0
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SUBJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  instructor TEXT,
  semester TEXT,
  academic_year TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  color TEXT DEFAULT '#003087',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subjects_is_active ON public.subjects(is_active);
CREATE INDEX idx_subjects_display_order ON public.subjects(display_order);

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TASKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('assignment', 'quiz', 'sheet', 'project', 'exam')),
  title TEXT NOT NULL,
  description TEXT,
  deadline DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  attachment_url TEXT,
  attachment_name TEXT,
  external_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_subject_id ON public.tasks(subject_id);
CREATE INDEX idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX idx_tasks_type ON public.tasks(type);
CREATE INDEX idx_tasks_status ON public.tasks(status);

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MATERIALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'image', 'document', 'presentation', 'spreadsheet', 'youtube', 'google_drive', 'external_link')),
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  external_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_materials_subject_id ON public.materials(subject_id);
CREATE INDEX idx_materials_type ON public.materials(type);
CREATE INDEX idx_materials_display_order ON public.materials(display_order);

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ANNOUNCEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_is_published ON public.announcements(is_published);
CREATE INDEX idx_announcements_subject_id ON public.announcements(subject_id);

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- CALENDAR EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  type TEXT NOT NULL CHECK (type IN ('exam', 'quiz', 'assignment_deadline', 'project_deadline', 'lecture', 'general')),
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_event_date ON public.calendar_events(event_date);
CREATE INDEX idx_calendar_events_subject_id ON public.calendar_events(subject_id);
CREATE INDEX idx_calendar_events_type ON public.calendar_events(type);

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
SELECT EXISTS (
  SELECT 1 FROM public.profiles
  WHERE id = auth.uid() AND role = 'admin'
);
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- PROFILES policies
CREATE POLICY "Profiles: admins read all" ON public.profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Profiles: users read own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles: users update own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles: admins update all" ON public.profiles
  FOR UPDATE USING (is_admin());

-- SUBJECTS policies
CREATE POLICY "Subjects: public read active" ON public.subjects
  FOR SELECT USING (is_active = true);

CREATE POLICY "Subjects: admins read all" ON public.subjects
  FOR SELECT USING (is_admin());

CREATE POLICY "Subjects: admins insert" ON public.subjects
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Subjects: admins update" ON public.subjects
  FOR UPDATE USING (is_admin());

CREATE POLICY "Subjects: admins delete" ON public.subjects
  FOR DELETE USING (is_admin());

-- TASKS policies
CREATE POLICY "Tasks: public read" ON public.tasks
  FOR SELECT USING (true);

CREATE POLICY "Tasks: admins insert" ON public.tasks
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Tasks: admins update" ON public.tasks
  FOR UPDATE USING (is_admin());

CREATE POLICY "Tasks: admins delete" ON public.tasks
  FOR DELETE USING (is_admin());

-- MATERIALS policies
CREATE POLICY "Materials: public read" ON public.materials
  FOR SELECT USING (true);

CREATE POLICY "Materials: admins insert" ON public.materials
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Materials: admins update" ON public.materials
  FOR UPDATE USING (is_admin());

CREATE POLICY "Materials: admins delete" ON public.materials
  FOR DELETE USING (is_admin());

-- ANNOUNCEMENTS policies
CREATE POLICY "Announcements: public read published" ON public.announcements
  FOR SELECT USING (is_published = true);

CREATE POLICY "Announcements: admins read all" ON public.announcements
  FOR SELECT USING (is_admin());

CREATE POLICY "Announcements: admins insert" ON public.announcements
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Announcements: admins update" ON public.announcements
  FOR UPDATE USING (is_admin());

CREATE POLICY "Announcements: admins delete" ON public.announcements
  FOR DELETE USING (is_admin());

-- CALENDAR EVENTS policies
CREATE POLICY "Calendar: public read" ON public.calendar_events
  FOR SELECT USING (true);

CREATE POLICY "Calendar: admins insert" ON public.calendar_events
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Calendar: admins update" ON public.calendar_events
  FOR UPDATE USING (is_admin());

CREATE POLICY "Calendar: admins delete" ON public.calendar_events
  FOR DELETE USING (is_admin());

-- ============================================================
-- DEMO SEED DATA (optional — remove before production)
-- ============================================================

INSERT INTO public.subjects (name, code, description, instructor, semester, academic_year, display_order, color) VALUES
  ('Thermodynamics', 'ME301', 'Study of energy transformations and heat-work relationships in mechanical systems.', 'Ahmed Hassan', 'Fall 2024', '2024-2025', 1, '#003087'),
  ('Fluid Mechanics', 'ME302', 'Principles of fluid behavior, flow analysis, and hydraulic systems.', 'Sara Ibrahim', 'Fall 2024', '2024-2025', 2, '#0047ba'),
  ('Machine Design', 'ME401', 'Design principles for mechanical components and systems.', 'Mohamed Ali', 'Fall 2024', '2024-2025', 3, '#7d3c98'),
  ('Heat Transfer', 'ME403', 'Conduction, convection, and radiation heat transfer mechanisms.', 'Ahmed Hassan', 'Fall 2024', '2024-2025', 4, '#c0392b'),
  ('Dynamics', 'ME201', 'Study of forces and motion of mechanical systems.', 'Omar Khaled', 'Fall 2024', '2024-2025', 5, '#1e8449'),
  ('Manufacturing Processes', 'ME402', 'Modern manufacturing methods, materials processing, and quality control.', 'Sara Ibrahim', 'Fall 2024', '2024-2025', 6, '#ca6f1e')
ON CONFLICT (code) DO NOTHING;
