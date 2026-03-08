
-- Add unique constraint on profiles.user_id for upsert support
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add experience and bio columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text DEFAULT '';

-- Create reviews/feedback table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id uuid NOT NULL,
  mentor_id uuid NOT NULL,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES public.slot_bookings(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  comment text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(booking_id, learner_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Learners insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = learner_id);
