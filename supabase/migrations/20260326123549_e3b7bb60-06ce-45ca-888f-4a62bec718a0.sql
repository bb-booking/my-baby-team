
-- Profiles table (one per user)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phase TEXT NOT NULL DEFAULT 'pregnant',
  role TEXT NOT NULL DEFAULT 'mor',
  due_or_birth_date TEXT NOT NULL DEFAULT '',
  parent_name TEXT NOT NULL DEFAULT '',
  partner_name TEXT NOT NULL DEFAULT '',
  children JSONB NOT NULL DEFAULT '[]'::jsonb,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  mor_health JSONB,
  parental_leave JSONB DEFAULT '{"mor": true, "far": false}'::jsonb,
  languages JSONB DEFAULT '{"mor": "da", "far": "da"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  assignee TEXT NOT NULL DEFAULT 'mor',
  category TEXT NOT NULL DEFAULT 'custom',
  completed BOOLEAN NOT NULL DEFAULT false,
  recurrence TEXT NOT NULL DEFAULT 'never',
  due_date TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tasks" ON public.tasks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Check-ins table
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  mood TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own check_ins" ON public.check_ins
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own check_ins" ON public.check_ins
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own check_ins" ON public.check_ins
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Nursing logs
CREATE TABLE public.nursing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  side TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nursing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own nursing_logs" ON public.nursing_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nursing_logs" ON public.nursing_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own nursing_logs" ON public.nursing_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Diaper logs
CREATE TABLE public.diaper_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  stool_color TEXT,
  stool_consistency TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.diaper_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own diaper_logs" ON public.diaper_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diaper_logs" ON public.diaper_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own diaper_logs" ON public.diaper_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Sleep logs
CREATE TABLE public.sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'manual'
);

ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sleep_logs" ON public.sleep_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep_logs" ON public.sleep_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep_logs" ON public.sleep_logs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep_logs" ON public.sleep_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Night shifts
CREATE TABLE public.night_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  assignee TEXT NOT NULL
);

ALTER TABLE public.night_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own night_shifts" ON public.night_shifts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own night_shifts" ON public.night_shifts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own night_shifts" ON public.night_shifts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own night_shifts" ON public.night_shifts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
