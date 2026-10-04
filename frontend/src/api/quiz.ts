import { apiRequest } from "./client";
import type { Quiz } from "../types";
export const quizApi = { generate: (materialId: string) => apiRequest<Quiz>("/quiz/generate", { method: "POST", body: JSON.stringify({ materialId }) }) };
