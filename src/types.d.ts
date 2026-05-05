import { Request } from "express";

type User = {
  id: string;
  username: string;
  password: string;

  role: "USER" | "ADMIN";

  createdAt: Date;
  deletedAt: Date | null;

  needsPasswordReset: boolean;
};

declare global {
  namespace Express {
    interface Request {
      sessionId: string | undefined;
      user: User | undefined;
    }
  }
}
