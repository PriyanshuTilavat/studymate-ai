import { progress, recentSessions } from "./mockData";

export const progressService = {
  async getOverview() {
    return progress;
  },
  async getRecentSessions() {
    return recentSessions;
  },
};
