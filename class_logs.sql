-- Run this in the Supabase SQL Editor to create the class_logs table

CREATE TABLE public.class_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  topic TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) policiesAC
ALTER TABLE public.class_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own class logs"
  ON public.class_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own class logs"
  ON public.class_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own class logs"
  ON public.class_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own class logs"
  ON public.class_logs FOR DELETE
  USING (auth.uid() = user_id);
