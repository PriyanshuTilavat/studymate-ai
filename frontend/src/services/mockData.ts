import type { ChatMessage, Material, Progress, Quiz, StudySession, User } from "../types";

export const currentUser: User = {
  id: "u-01",
  name: "Priyanshu",
  email: "priyanshu@example.com",
  role: "student",
};

export const materials: Material[] = [
  {
    id: "java-oop",
    title: "Java OOP Notes",
    subject: "Object Oriented Programming",
    type: "pdf",
    pages: 42,
    progress: 68,
    lastStudied: "2 hours ago",
    studyMinutes: 95,
    status: "ready",
    color: "violet",
    topics: ["Introduction", "Classes", "Objects", "Inheritance", "Polymorphism", "Abstraction", "Encapsulation"].map((title, index) => ({
      id: `oop-${index}`,
      title,
      confidence: [91, 88, 86, 75, 42, 68, 79][index],
      completed: index < 5,
    })),
  },
  {
    id: "dbms-unit-3",
    title: "DBMS Unit 3",
    subject: "Database Management Systems",
    type: "ppt",
    pages: 28,
    progress: 44,
    lastStudied: "Yesterday",
    studyMinutes: 62,
    status: "ready",
    color: "blue",
    topics: ["Normalization", "Transactions", "Indexing", "JDBC"].map((title, index) => ({ id: `db-${index}`, title, confidence: [76, 72, 70, 63][index], completed: index < 2 })),
  },
  {
    id: "dsa-recursion",
    title: "DSA: Recursion",
    subject: "Data Structures & Algorithms",
    type: "doc",
    pages: 18,
    progress: 31,
    lastStudied: "3 days ago",
    studyMinutes: 41,
    status: "ready",
    color: "amber",
    topics: ["Base cases", "Call stack", "Backtracking", "Complexity"].map((title, index) => ({ id: `dsa-${index}`, title, confidence: [82, 65, 51, 58][index], completed: index === 0 })),
  },
];

export const recentSessions: StudySession[] = [
  { id: "s1", materialTitle: "Java OOP", mode: "Teacher", duration: 18, occurredAt: "10 min ago" },
  { id: "s2", materialTitle: "DBMS", mode: "Quiz", duration: 12, occurredAt: "Yesterday" },
];

export const progress: Progress = {
  totalMinutes: 864,
  streak: 7,
  questionsSolved: 184,
  quizAccuracy: 82,
  topicsCompleted: 24,
  weeklyMinutes: [42, 68, 31, 78, 52, 71, 44],
  weeklyAccuracy: [72, 76, 74, 81, 79, 86, 82],
  weakTopics: [
    { name: "Polymorphism", confidence: 42, materialId: "java-oop" },
    { name: "Recursion", confidence: 51, materialId: "dsa-recursion" },
    { name: "JDBC", confidence: 63, materialId: "dbms-unit-3" },
    { name: "Abstraction", confidence: 68, materialId: "java-oop" },
  ],
};

export const javaQuiz: Quiz = {
  id: "quiz-java-01",
  title: "Java OOP Quiz",
  materialId: "java-oop",
  questions: [
    { id: "q1", prompt: "Which concept allows one interface to have multiple implementations?", options: ["Encapsulation", "Polymorphism", "Inheritance", "Abstraction"], correctIndex: 1, explanation: "Polymorphism lets the same interface represent different underlying forms or implementations.", source: "Java OOP Notes - Page 12" },
    { id: "q2", prompt: "Which keyword prevents a class from being inherited in Java?", options: ["static", "private", "final", "const"], correctIndex: 2, explanation: "A class declared final cannot be extended by another class.", source: "Java OOP Notes - Page 19" },
    { id: "q3", prompt: "What is the main purpose of encapsulation?", options: ["Repeat code", "Hide internal state", "Create threads", "Import packages"], correctIndex: 1, explanation: "Encapsulation protects internal state and exposes controlled access through methods.", source: "Java OOP Notes - Page 8" },
    { id: "q4", prompt: "Method overriding is resolved at which time?", options: ["Compile time", "Link time", "Runtime", "Load time only"], correctIndex: 2, explanation: "Overridden instance methods use dynamic dispatch and are selected at runtime.", source: "Java OOP Notes - Page 14" },
  ],
};

export const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content: "Hi Priyanshu. What would you like to understand today? I can explain concepts from your notes or help you work through a question.",
    createdAt: "Now",
  },
];
