import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "./types";
import { db } from "./lib/db";

export const getToken = (req: Request): string | null => {
  if (req.cookies.accessToken) return req.cookies.accessToken;
  if (process.env.NODE_ENV === "development") {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  }
  return null;
};

const AuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = getToken(req);

  if (!token) return res.status(401).json({ error: "Unauthorized." });

  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    console.error(
      "Attempted to verify a JWT but no secret is defined in environment variables! Please ",
    );
    return res.status(500).json({
      error:
        "An internal server error occurred. Please contact the system administrator.",
      code: "INTERNAL_ERROR",
    });
  }

  try {
    const payload = jwt.verify(token, secret) as {
      sessionId: string;
      sub: string;
      role: "USER" | "ADMIN";
    };

    // Users that are deactivated will not be found
    const session = await db.session.findUnique({
      where: {
        id: payload.sessionId,
        user: {
          deletedAt: null,
        },
      },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ error: "Invalid session.", code: "INVALID_SESSION" });
    }

    if (session.user.needsPasswordReset) {
      if (req.path !== "/reset-password")
        return res.status(401).json({
          error: "Please reset your password.",
          code: "NEEDS_PASSWORD_RESET",
        });
    }

    req.user = session.user;
    req.sessionId = session.id;
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Invalid or expired token.", code: "BAD_ACCESS_TOKEN" });
  }
};

export default AuthMiddleware;
