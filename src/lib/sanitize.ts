import { User } from "@/types";

export const sanitizeUser = (user: User) => {
  const { password, ...sanitized } = user;
  return sanitized;
};
