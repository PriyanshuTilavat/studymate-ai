import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AuthPage } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Learn from "./pages/Learn";
import MaterialDetail from "./pages/MaterialDetail";
import Materials from "./pages/Materials";
import Notifications from "./pages/Notifications";
import ProgressPage from "./pages/Progress";
import Quiz from "./pages/Quiz";
import Settings from "./pages/Settings";
import Teacher from "./pages/Teacher";

function Page({ children }: { children: ReactNode }) {
  return <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .22 }}>{children}</motion.div>;
}

function AppRoutes() {
  const location = useLocation();
  return <AnimatePresence mode="wait"><Routes location={location} key={location.pathname}>
    <Route path="/" element={<Page><Landing /></Page>} />
    <Route path="/login" element={<Page><AuthPage mode="login" /></Page>} />
    <Route path="/signup" element={<Page><AuthPage mode="signup" /></Page>} />
    <Route path="/forgot-password" element={<Page><AuthPage mode="forgot" /></Page>} />
    <Route path="/app" element={<AppShell />}>
      <Route index element={<Page><Dashboard /></Page>} />
      <Route path="materials" element={<Page><Materials /></Page>} />
      <Route path="materials/:id" element={<Page><MaterialDetail /></Page>} />
      <Route path="learn" element={<Page><Learn /></Page>} />
      <Route path="teacher" element={<Page><Teacher /></Page>} />
      <Route path="quiz" element={<Page><Quiz /></Page>} />
      <Route path="progress" element={<Page><ProgressPage /></Page>} />
      <Route path="settings" element={<Page><Settings /></Page>} />
      <Route path="notifications" element={<Page><Notifications /></Page>} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AnimatePresence>;
}

export default function App() { return <BrowserRouter><AppRoutes /></BrowserRouter>; }
