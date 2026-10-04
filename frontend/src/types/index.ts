export type MaterialStatus = "ready" | "processing" | "failed";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student";
  avatar?: string;
}

export interface Topic {
  id: string;
  title: string;
  confidence: number;
  completed: boolean;
}

export interface Material {
  id: string;
  title: string;
  subject: string;
  type: "pdf" | "ppt" | "doc" | "image" | "txt";
  pages: number;
  topics: Topic[];
  progress: number;
  lastStudied: string;
  studyMinutes: number;
  status: MaterialStatus;
  color: string;
}

export interface StudySession {
  id: string;
  materialTitle: string;
  mode: "Learn" | "Teacher" | "Quiz";
  duration: number;
  occurredAt: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string;
}

export interface Quiz {
  id: string;
  title: string;
  materialId: string;
  questions: QuizQuestion[];
}

export interface QuizResult {
  quizId: string;
  score: number;
  total: number;
  strongTopics: string[];
  weakTopics: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: string;
  createdAt: string;
}

export interface WeakTopic {
  name: string;
  confidence: number;
  materialId: string;
}

export interface Progress {
  totalMinutes: number;
  streak: number;
  questionsSolved: number;
  quizAccuracy: number;
  topicsCompleted: number;
  weeklyMinutes: number[];
  weeklyAccuracy: number[];
  weakTopics: WeakTopic[];
}
