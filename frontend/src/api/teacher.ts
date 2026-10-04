import { apiRequest } from "./client";
import type { ChatMessage } from "../types";
export const teacherApi = { ask: (content: string, materialId?: string) => apiRequest<ChatMessage>("/teacher/chat", { method: "POST", body: JSON.stringify({ content, materialId }) }) };
