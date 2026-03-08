
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'both' CHECK (role IN ('teach', 'learn', 'both')),
  credits INTEGER NOT NULL DEFAULT 50,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'both')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- 3. Skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  credits INTEGER NOT NULL DEFAULT 10,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  assessment_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills viewable by everyone" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Mentors insert own skills" ON public.skills FOR INSERT WITH CHECK (auth.uid() = mentor_id);
CREATE POLICY "Mentors update own skills" ON public.skills FOR UPDATE USING (auth.uid() = mentor_id);
CREATE POLICY "Mentors delete own skills" ON public.skills FOR DELETE USING (auth.uid() = mentor_id);

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON public.skills
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. MCQ Questions
CREATE TABLE public.mcq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_category TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'learner' CHECK (question_type IN ('teacher_assessment', 'learner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mcq_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "MCQ questions viewable by authenticated" ON public.mcq_questions FOR SELECT TO authenticated USING (true);

-- 5. Teacher Assessments
CREATE TABLE public.teacher_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, skill_id)
);

ALTER TABLE public.teacher_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers view own assessments" ON public.teacher_assessments FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers insert own assessments" ON public.teacher_assessments FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- 6. Teaching Slots
CREATE TABLE public.teaching_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  google_meet_link TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.teaching_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Slots viewable by everyone" ON public.teaching_slots FOR SELECT USING (true);
CREATE POLICY "Mentors insert own slots" ON public.teaching_slots FOR INSERT WITH CHECK (auth.uid() = mentor_id);
CREATE POLICY "Mentors update own slots" ON public.teaching_slots FOR UPDATE USING (auth.uid() = mentor_id);
CREATE POLICY "Mentors delete own slots" ON public.teaching_slots FOR DELETE USING (auth.uid() = mentor_id);

-- 7. Slot Bookings
CREATE TABLE public.slot_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.teaching_slots(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  credits INTEGER NOT NULL,
  google_meet_link TEXT,
  booked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.slot_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookings" ON public.slot_bookings FOR SELECT USING (auth.uid() = learner_id OR auth.uid() = mentor_id);
CREATE POLICY "Learners insert bookings" ON public.slot_bookings FOR INSERT WITH CHECK (auth.uid() = learner_id);
CREATE POLICY "Participants update bookings" ON public.slot_bookings FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = learner_id);

CREATE TRIGGER update_slot_bookings_updated_at BEFORE UPDATE ON public.slot_bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Test Results
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.slot_bookings(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  pass_percentage NUMERIC(5,2) NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own results" ON public.test_results FOR SELECT USING (auth.uid() = learner_id);
CREATE POLICY "Users insert own results" ON public.test_results FOR INSERT WITH CHECK (auth.uid() = learner_id);
CREATE POLICY "Mentors view session results" ON public.test_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.slot_bookings sb WHERE sb.id = booking_id AND sb.mentor_id = auth.uid())
);

-- 9. Certificates
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  test_result_id UUID NOT NULL REFERENCES public.test_results(id) ON DELETE CASCADE,
  learner_name TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  mentor_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Users insert own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = learner_id);

-- 10. Credit transactions
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'refund', 'bonus')),
  description TEXT,
  booking_id UUID REFERENCES public.slot_bookings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own transactions" ON public.credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DB functions
CREATE OR REPLACE FUNCTION public.update_user_credits(p_user_id UUID, p_amount INTEGER)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET credits = credits + p_amount WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_teacher_bonus(p_booking_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_mentor_id UUID; v_skill_id UUID; v_credits INTEGER;
  v_total_results INTEGER; v_passed_results INTEGER; v_pass_rate NUMERIC; v_bonus INTEGER := 0;
BEGIN
  SELECT mentor_id, skill_id, credits INTO v_mentor_id, v_skill_id, v_credits
  FROM public.slot_bookings WHERE id = p_booking_id;
  SELECT COUNT(*), COUNT(*) FILTER (WHERE passed = true)
  INTO v_total_results, v_passed_results
  FROM public.test_results WHERE skill_id = v_skill_id;
  IF v_total_results > 0 THEN
    v_pass_rate := (v_passed_results::NUMERIC / v_total_results::NUMERIC) * 100;
    IF v_pass_rate > 75 THEN
      v_bonus := v_credits;
      PERFORM public.update_user_credits(v_mentor_id, v_bonus);
      INSERT INTO public.credit_transactions (user_id, amount, type, description, booking_id)
      VALUES (v_mentor_id, v_bonus, 'bonus', 'Bonus: high learner pass rate (' || ROUND(v_pass_rate) || '%)', p_booking_id);
    END IF;
  END IF;
  RETURN v_bonus;
END;
$$;
