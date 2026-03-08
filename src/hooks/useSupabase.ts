import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// ============ SKILLS ============
export const useApprovedSkills = () => useQuery({
  queryKey: ['skills'],
  queryFn: async () => {
    const { data, error } = await supabase.from('skills').select('*').eq('is_approved', true);
    if (error) throw error;
    const ids = [...new Set((data || []).map(s => s.mentor_id))];
    if (ids.length === 0) return [];
    const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, avatar_url').in('user_id', ids);
    const pm = new Map((profiles || []).map(p => [p.user_id, p]));
    return (data || []).map(s => ({
      ...s,
      mentorName: pm.get(s.mentor_id)?.full_name || 'Unknown',
      mentorAvatar: pm.get(s.mentor_id)?.avatar_url,
    }));
  },
});

export const useMySkills = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['skills', 'my', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('skills').select('*').eq('mentor_id', user!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useSkillById = (skillId?: string) => useQuery({
  queryKey: ['skill', skillId],
  queryFn: async () => {
    const { data, error } = await supabase.from('skills').select('*').eq('id', skillId!).single();
    if (error) throw error;
    const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('user_id', data.mentor_id).single();
    return { ...data, mentorName: profile?.full_name || 'Unknown', mentorAvatar: profile?.avatar_url };
  },
  enabled: !!skillId,
});

export const useRegisterSkill = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (skill: { name: string; category: string; description: string; credits: number }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('skills').insert({ ...skill, mentor_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  });
};

export const useApproveSkill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ skillId, score }: { skillId: string; score: number }) => {
      const { error } = await supabase.from('skills').update({ is_approved: true, assessment_score: score }).eq('id', skillId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  });
};

// ============ TEACHING SLOTS ============
export const useAvailableSlots = (skillId?: string) => useQuery({
  queryKey: ['slots', skillId],
  queryFn: async () => {
    let q = supabase.from('teaching_slots').select('*').eq('is_available', true);
    if (skillId) q = q.eq('skill_id', skillId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },
});

export const useMySlots = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['slots', 'my', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teaching_slots')
        .select('*, skills(name)')
        .eq('mentor_id', user!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useAddSlot = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (slot: { skill_id: string; slot_date: string; slot_time: string; google_meet_link?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('teaching_slots').insert({ ...slot, mentor_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slots'] }),
  });
};

export const useDeleteSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase.from('teaching_slots').delete().eq('id', slotId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slots'] }),
  });
};

// ============ BOOKINGS ============
export const useMyBookings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('slot_bookings')
        .select('*, skills(name, category), teaching_slots(slot_date, slot_time, google_meet_link)')
        .or(`learner_id.eq.${user.id},mentor_id.eq.${user.id}`);
      if (error) throw error;
      const userIds = [...new Set((data || []).flatMap(b => [b.learner_id, b.mentor_id]))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, full_name').in('user_id', userIds);
      const pm = new Map((profiles || []).map(p => [p.user_id, p.full_name]));
      return (data || []).map(b => ({
        ...b,
        skillName: (b as any).skills?.name || '',
        skillCategory: (b as any).skills?.category || '',
        slotDate: (b as any).teaching_slots?.slot_date || '',
        slotTime: (b as any).teaching_slots?.slot_time || '',
        meetLink: b.google_meet_link || (b as any).teaching_slots?.google_meet_link || '',
        mentorName: pm.get(b.mentor_id) || '',
        learnerName: pm.get(b.learner_id) || '',
      }));
    },
    enabled: !!user,
  });
};

export const useBookSlot = () => {
  const qc = useQueryClient();
  const { user, refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async ({ slotId, skillId }: { slotId: string; skillId: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data: slot } = await supabase.from('teaching_slots').select('*').eq('id', slotId).single();
      const { data: skill } = await supabase.from('skills').select('*').eq('id', skillId).single();
      if (!slot || !skill) throw new Error('Slot or skill not found');
      const { data: profile } = await supabase.from('profiles').select('credits').eq('user_id', user.id).single();
      if (!profile || profile.credits < skill.credits) throw new Error(`Insufficient credits. You need ${skill.credits} credits.`);
      const { error } = await supabase.from('slot_bookings').insert({
        slot_id: slotId, skill_id: skillId, learner_id: user.id,
        mentor_id: slot.mentor_id, credits: skill.credits,
        google_meet_link: slot.google_meet_link,
      });
      if (error) throw error;
      await supabase.from('teaching_slots').update({ is_available: false }).eq('id', slotId);
      await supabase.rpc('update_user_credits', { p_user_id: user.id, p_amount: -skill.credits });
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
      await refreshProfile();
    },
  });
};

export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();
  const { refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const { data: booking } = await supabase.from('slot_bookings').select('*').eq('id', bookingId).single();
      if (!booking) throw new Error('Booking not found');
      const { error } = await supabase.from('slot_bookings').update({ status }).eq('id', bookingId);
      if (error) throw error;
      if (status === 'cancelled') await supabase.rpc('update_user_credits', { p_user_id: booking.learner_id, p_amount: booking.credits });
      if (status === 'completed') await supabase.rpc('update_user_credits', { p_user_id: booking.mentor_id, p_amount: booking.credits });
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      await refreshProfile();
    },
  });
};

// ============ ASSESSMENTS ============
export const useAddAssessment = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (a: { skill_id: string; score: number; passed: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('teacher_assessments').insert({ ...a, teacher_id: user.id });
      if (error) throw error;
    },
  });
};

// ============ TEST RESULTS ============
export const useMyTestResults = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['test_results', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('test_results').select('*').eq('learner_id', user!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useAddTestResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: { booking_id: string; learner_id: string; skill_id: string; score: number; total_questions: number; pass_percentage: number; passed: boolean }) => {
      const { data, error } = await supabase.from('test_results').insert(r).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['test_results'] }),
  });
};

// ============ CERTIFICATES ============
export const useMyCertificates = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('certificates').select('*').eq('learner_id', user!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useAddCertificate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: { learner_id: string; learner_name: string; skill_id: string; skill_name: string; mentor_name: string; score: number; test_result_id: string }) => {
      const { error } = await supabase.from('certificates').insert(c);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['certificates'] }),
  });
};

// ============ REVIEWS ============
export const useReviews = (mentorId?: string) => useQuery({
  queryKey: ['reviews', mentorId],
  queryFn: async () => {
    let q = supabase.from('reviews').select('*');
    if (mentorId) q = q.eq('mentor_id', mentorId);
    const { data, error } = await q;
    if (error) throw error;
    if (!data || data.length === 0) return [];
    const ids = [...new Set(data.map((r: any) => r.learner_id))] as string[];
    const { data: profiles } = await supabase.from('profiles').select('user_id, full_name').in('user_id', ids);
    const pm = new Map((profiles || []).map(p => [p.user_id, p.full_name]));
    return data.map((r: any) => ({ ...r, learnerName: pm.get(r.learner_id) || 'Anonymous' }));
  },
});

export const useAddReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: { learner_id: string; mentor_id: string; skill_id: string; booking_id: string; rating: number; comment: string }) => {
      const { error } = await supabase.from('reviews').insert(review);
      if (error) throw error;
      const { data: reviews } = await supabase.from('reviews').select('rating').eq('skill_id', review.skill_id);
      if (reviews?.length > 0) {
        const avg = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
        await supabase.from('skills').update({ rating: Math.round(avg * 10) / 10, review_count: reviews.length }).eq('id', review.skill_id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};

// ============ PROFILES ============
export const useProfileById = (userId?: string) => useQuery({
  queryKey: ['profile', userId],
  queryFn: async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId!).single();
    if (error) throw error;
    return data;
  },
  enabled: !!userId,
});

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  const { user, refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('profiles').update(updates).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      await refreshProfile();
    },
  });
};

export const useTeacherBonus = () => useMutation({
  mutationFn: async (bookingId: string) => {
    await supabase.rpc('calculate_teacher_bonus', { p_booking_id: bookingId });
  },
});
