import type { ChatMessage } from "../types";

export const teacherService = {
  async sendMessage(content: string): Promise<ChatMessage> {
    // Explicitly avoid inventing an AI response while no backend is connected.
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `I received your question: "${content}". Connect the StudyMate Teacher API to generate a source-grounded explanation from your material.`,
      createdAt: "Now",
    };
  },
};
