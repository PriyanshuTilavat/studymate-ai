import { currentUser } from "./mockData";
import type { User } from "../types";

export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    if (!email || !password) throw new Error("Email and password are required.");
    return currentUser;
  },
  async signUp(name: string, email: string, password: string): Promise<User> {
    if (!name || !email || password.length < 6) throw new Error("Please complete all fields. Password must be at least 6 characters.");
    return { ...currentUser, name, email };
  },
};
