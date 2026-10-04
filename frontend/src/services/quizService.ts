import { javaQuiz } from "./mockData";
import type { Quiz } from "../types";

export const quizService = {
  async getForMaterial(materialId: string): Promise<Quiz> {
    return { ...javaQuiz, materialId };
  },
  async generate(): Promise<never> {
    throw new Error("Quiz generation requires the StudyMate API. A sample quiz is available for preview.");
  },
};
