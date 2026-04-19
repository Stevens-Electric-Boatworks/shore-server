import { Request } from "express";

type User = {
  id: string;
  username: string;
  password: string;

  role: "USER" | "ADMIN";

  refreshToken?: string;
  refreshTokenCreatedAt?: Date;
};

declare global {
  namespace Express {
    interface Request {
      user: User | undefined;
    }
  }
}
