import { apiRequest } from "./client";
import type { User } from "../types";
export const authApi = { signIn: (body: { email: string; password: string }) => apiRequest<User>("/auth/login", { method: "POST", body: JSON.stringify(body) }) };
