import { apiRequest } from "./client";
import type { Material } from "../types";
export const materialsApi = { list: () => apiRequest<Material[]>("/materials"), get: (id: string) => apiRequest<Material>(`/materials/${id}`) };
