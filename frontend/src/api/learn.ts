import { apiRequest } from "./client";
export const learnApi = { getNotes: (materialId: string) => apiRequest(`/learn/${materialId}`) };
