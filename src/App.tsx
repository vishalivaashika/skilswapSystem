import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import BookSession from "./pages/BookSession";
import RegisterSkill from "./pages/RegisterSkill";
import ManageSlots from "./pages/ManageSlots";
import ManageSessions from "./pages/ManageSessions";
import MCQTest from "./pages/MCQTest";
import TeacherAssessment from "./pages/TeacherAssessment";
import Certificates from "./pages/Certificates";
import Portfolio from "./pages/Portfolio";
import Account from "./pages/Account";
import TeacherProfile from "./pages/TeacherProfile";
import LanguageSelection from "./pages/LanguageSelection";
import CourseSelection from "./pages/CourseSelection";
import TeacherList from "./pages/TeacherList";
import FeedbackPage from "./pages/FeedbackPage";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/book/:skillId" element={<BookSession />} />
            <Route path="/register-skill" element={<RegisterSkill />} />
            <Route path="/manage-slots" element={<ManageSlots />} />
            <Route path="/manage-sessions" element={<ManageSessions />} />
            <Route path="/mcq-test/:bookingId" element={<MCQTest />} />
            <Route path="/teacher-assessment/:skillId" element={<TeacherAssessment />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/account" element={<Account />} />
            <Route path="/teacher/:teacherId" element={<TeacherProfile />} />
            <Route path="/language-selection" element={<LanguageSelection />} />
            <Route path="/course-selection" element={<CourseSelection />} />
            <Route path="/teachers" element={<TeacherList />} />
            <Route path="/feedback" element={<FeedbackPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
