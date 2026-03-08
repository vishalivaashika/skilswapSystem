import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'teach' | 'learn' | 'both';
  credits: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  credits: number;
  mentorId: string;
  mentorName: string;
  rating: number;
  reviewCount: number;
  isApproved: boolean;
  assessmentScore?: number;
}

export interface TeachingSlot {
  id: string;
  skillId: string;
  mentorId: string;
  date: string;
  time: string;
  isAvailable: boolean;
  googleMeetLink?: string;
}

export interface Booking {
  id: string;
  slotId: string;
  skillId: string;
  skillName: string;
  mentorId: string;
  mentorName: string;
  learnerId: string;
  learnerName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  credits: number;
  googleMeetLink?: string;
}

export interface Certificate {
  id: string;
  learnerId: string;
  learnerName: string;
  skillId: string;
  skillName: string;
  mentorName: string;
  score: number;
  completedDate: string;
}

export interface TestResult {
  id: string;
  bookingId: string;
  learnerId: string;
  skillId: string;
  score: number;
  totalQuestions: number;
  passPercentage: number;
  passed: boolean;
}

export interface Assessment {
  id: string;
  teacherId: string;
  skillId: string;
  score: number;
  passed: boolean;
}

const uid = () => crypto.randomUUID();

// Predefined tech skills with mock mentors
const defaultSkills: Skill[] = [
  { id: 's1', name: 'Python Programming', category: 'Python', description: 'Learn Python from basics to advanced — data types, loops, OOP, file handling, and libraries.', credits: 15, mentorId: 'demo1', mentorName: 'Alex Johnson', rating: 4.8, reviewCount: 24, isApproved: true },
  { id: 's2', name: 'Java Development', category: 'Java', description: 'Master Java fundamentals, OOP, multithreading, collections, and enterprise patterns.', credits: 18, mentorId: 'demo2', mentorName: 'Sarah Chen', rating: 4.9, reviewCount: 31, isApproved: true },
  { id: 's3', name: 'C++ Fundamentals', category: 'C++', description: 'Deep dive into C++ — pointers, memory management, STL, templates, and competitive programming.', credits: 20, mentorId: 'demo3', mentorName: 'Mike Ross', rating: 4.7, reviewCount: 18, isApproved: true },
  { id: 's4', name: 'Web Development', category: 'Web Development', description: 'Full-stack web dev — HTML, CSS, JavaScript, React, Node.js, and REST APIs.', credits: 16, mentorId: 'demo4', mentorName: 'Emily Davis', rating: 4.6, reviewCount: 22, isApproved: true },
  { id: 's5', name: 'Artificial Intelligence', category: 'Artificial Intelligence', description: 'AI foundations — search algorithms, neural networks, NLP, and computer vision.', credits: 22, mentorId: 'demo5', mentorName: 'James Wilson', rating: 4.9, reviewCount: 45, isApproved: true },
  { id: 's6', name: 'Machine Learning', category: 'Machine Learning', description: 'ML algorithms — regression, classification, clustering, deep learning with TensorFlow/PyTorch.', credits: 20, mentorId: 'demo6', mentorName: 'Lisa Park', rating: 4.5, reviewCount: 16, isApproved: true },
  { id: 's7', name: 'Data Structures & Algorithms', category: 'Data Structures', description: 'Arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming.', credits: 14, mentorId: 'demo7', mentorName: 'Ryan Kumar', rating: 4.8, reviewCount: 38, isApproved: true },
  { id: 's8', name: 'Database Systems', category: 'Database Systems', description: 'SQL, NoSQL, normalization, indexing, transactions, and database design patterns.', credits: 12, mentorId: 'demo8', mentorName: 'Nina Patel', rating: 4.7, reviewCount: 20, isApproved: true },
  { id: 's9', name: 'Cloud Computing', category: 'Cloud Computing', description: 'AWS, Azure, GCP — EC2, S3, Lambda, Docker, Kubernetes, and cloud architecture.', credits: 18, mentorId: 'demo9', mentorName: 'David Kim', rating: 4.6, reviewCount: 27, isApproved: true },
];

// Demo teaching slots
const defaultSlots: TeachingSlot[] = [
  { id: 'slot1', skillId: 's1', mentorId: 'demo1', date: '2026-03-10', time: '10:00', isAvailable: true, googleMeetLink: 'https://meet.google.com/abc-defg-hij' },
  { id: 'slot2', skillId: 's1', mentorId: 'demo1', date: '2026-03-11', time: '14:00', isAvailable: true, googleMeetLink: 'https://meet.google.com/abc-defg-hij' },
  { id: 'slot3', skillId: 's2', mentorId: 'demo2', date: '2026-03-10', time: '11:00', isAvailable: true, googleMeetLink: 'https://meet.google.com/xyz-uvwx-rst' },
  { id: 'slot4', skillId: 's3', mentorId: 'demo3', date: '2026-03-12', time: '09:00', isAvailable: true },
  { id: 'slot5', skillId: 's4', mentorId: 'demo4', date: '2026-03-11', time: '15:00', isAvailable: true, googleMeetLink: 'https://meet.google.com/web-dev-meet' },
  { id: 'slot6', skillId: 's5', mentorId: 'demo5', date: '2026-03-13', time: '10:00', isAvailable: true },
  { id: 'slot7', skillId: 's7', mentorId: 'demo7', date: '2026-03-10', time: '16:00', isAvailable: true, googleMeetLink: 'https://meet.google.com/dsa-meet-lnk' },
  { id: 'slot8', skillId: 's8', mentorId: 'demo8', date: '2026-03-14', time: '13:00', isAvailable: true },
  { id: 'slot9', skillId: 's9', mentorId: 'demo9', date: '2026-03-12', time: '11:00', isAvailable: true, googleMeetLink: 'https://meet.google.com/cloud-meet' },
];

interface AppState {
  // Data
  users: AppUser[];
  currentUserId: string | null;
  skills: Skill[];
  teachingSlots: TeachingSlot[];
  bookings: Booking[];
  certificates: Certificate[];
  testResults: TestResult[];
  assessments: Assessment[];

  // Auth
  register: (email: string, password: string, name: string, role: 'teach' | 'learn' | 'both') => { error?: string };
  login: (email: string, password: string) => { error?: string };
  logout: () => void;
  getCurrentUser: () => AppUser | null;
  updateProfile: (name: string) => void;
  updatePassword: (newPassword: string) => void;

  // Skills
  registerSkill: (skill: Omit<Skill, 'id' | 'rating' | 'reviewCount' | 'isApproved' | 'mentorId' | 'mentorName'>) => Skill;
  approveSkill: (skillId: string, score: number) => void;

  // Slots
  addTeachingSlot: (slot: Omit<TeachingSlot, 'id' | 'isAvailable'>) => void;
  deleteTeachingSlot: (slotId: string) => void;

  // Bookings
  bookSlot: (slotId: string, skillId: string) => { error?: string };
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;

  // Tests & Certificates
  addAssessment: (assessment: Omit<Assessment, 'id'>) => void;
  addTestResult: (result: Omit<TestResult, 'id'>) => string;
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  calculateTeacherBonus: (bookingId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      skills: defaultSkills,
      teachingSlots: defaultSlots,
      bookings: [],
      certificates: [],
      testResults: [],
      assessments: [],

      register: (email, password, name, role) => {
        const { users } = get();
        const exists = users.find((u) => u.email === email);
        if (exists) return { error: 'An account with this email already exists.' };
        const newUser: AppUser = { id: uid(), email, password, name, role, credits: 100 };
        set({ users: [...users, newUser], currentUserId: newUser.id });
        return {};
      },

      login: (email, password) => {
        const { users } = get();
        const user = users.find((u) => u.email === email && u.password === password);
        if (!user) return { error: 'Invalid credentials. Please try again.' };
        set({ currentUserId: user.id });
        return {};
      },

      logout: () => set({ currentUserId: null }),

      getCurrentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId) || null;
      },

      updateProfile: (name) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({
          users: s.users.map((u) => (u.id === currentUserId ? { ...u, name } : u)),
        }));
      },

      updatePassword: (newPassword) => {
        const { currentUserId } = get();
        if (!currentUserId) return;
        set((s) => ({
          users: s.users.map((u) => (u.id === currentUserId ? { ...u, password: newPassword } : u)),
        }));
      },

      registerSkill: (skillData) => {
        const user = get().getCurrentUser();
        if (!user) throw new Error('Not authenticated');
        const newSkill: Skill = {
          ...skillData,
          id: uid(),
          mentorId: user.id,
          mentorName: user.name,
          rating: 0,
          reviewCount: 0,
          isApproved: false,
        };
        set((s) => ({ skills: [...s.skills, newSkill] }));
        return newSkill;
      },

      approveSkill: (skillId, score) => {
        set((s) => ({
          skills: s.skills.map((sk) =>
            sk.id === skillId ? { ...sk, isApproved: true, assessmentScore: score } : sk
          ),
        }));
      },

      addTeachingSlot: (slot) => {
        set((s) => ({
          teachingSlots: [...s.teachingSlots, { ...slot, id: uid(), isAvailable: true }],
        }));
      },

      deleteTeachingSlot: (slotId) => {
        set((s) => ({
          teachingSlots: s.teachingSlots.filter((sl) => sl.id !== slotId),
        }));
      },

      bookSlot: (slotId, skillId) => {
        const state = get();
        const user = state.getCurrentUser();
        if (!user) return { error: 'Not authenticated' };
        const slot = state.teachingSlots.find((s) => s.id === slotId);
        if (!slot || !slot.isAvailable) return { error: 'Slot not available' };
        const skill = state.skills.find((s) => s.id === skillId);
        if (!skill) return { error: 'Skill not found' };
        if (user.credits < skill.credits) return { error: `Insufficient credits. You need ${skill.credits} credits.` };

        const booking: Booking = {
          id: uid(),
          slotId,
          skillId,
          skillName: skill.name,
          mentorId: skill.mentorId,
          mentorName: skill.mentorName,
          learnerId: user.id,
          learnerName: user.name,
          date: slot.date,
          time: slot.time,
          status: 'pending',
          credits: skill.credits,
          googleMeetLink: slot.googleMeetLink,
        };

        set((s) => ({
          bookings: [...s.bookings, booking],
          teachingSlots: s.teachingSlots.map((sl) =>
            sl.id === slotId ? { ...sl, isAvailable: false } : sl
          ),
          users: s.users.map((u) =>
            u.id === user.id ? { ...u, credits: u.credits - skill.credits } : u
          ),
        }));
        return {};
      },

      updateBookingStatus: (bookingId, status) => {
        const state = get();
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!booking) return;

        set((s) => {
          let users = s.users;
          if (status === 'cancelled') {
            // Refund learner
            users = users.map((u) =>
              u.id === booking.learnerId ? { ...u, credits: u.credits + booking.credits } : u
            );
          }
          if (status === 'completed') {
            // Pay mentor
            users = users.map((u) =>
              u.id === booking.mentorId ? { ...u, credits: u.credits + booking.credits } : u
            );
          }
          return {
            bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, status } : b)),
            users,
          };
        });
      },

      addAssessment: (assessment) => {
        set((s) => ({ assessments: [...s.assessments, { ...assessment, id: uid() }] }));
      },

      addTestResult: (result) => {
        const id = uid();
        set((s) => ({ testResults: [...s.testResults, { ...result, id }] }));
        return id;
      },

      addCertificate: (cert) => {
        set((s) => ({ certificates: [...s.certificates, { ...cert, id: uid() }] }));
      },

      calculateTeacherBonus: (bookingId) => {
        const state = get();
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!booking) return;
        // Get all test results for this skill's bookings with this mentor
        const relatedBookings = state.bookings.filter(
          (b) => b.skillId === booking.skillId && b.mentorId === booking.mentorId && b.status === 'completed'
        );
        const relatedResults = state.testResults.filter((r) =>
          relatedBookings.some((b) => b.id === r.bookingId)
        );
        if (relatedResults.length === 0) return;
        const avgPass = relatedResults.reduce((sum, r) => sum + r.passPercentage, 0) / relatedResults.length;
        if (avgPass > 75) {
          // Double credits bonus
          set((s) => ({
            users: s.users.map((u) =>
              u.id === booking.mentorId ? { ...u, credits: u.credits + booking.credits } : u
            ),
          }));
        }
      },
    }),
    { name: 'skillswap-storage' }
  )
);
