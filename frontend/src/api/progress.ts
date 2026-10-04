import { apiRequest } from "./client";
import type { Progress } from "../types";
export const progressApi = { overview: () => apiRequest<Progress>("/progress") };