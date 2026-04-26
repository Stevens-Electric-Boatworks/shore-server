import { db } from "@/lib/db";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const getRefreshToken = (req: Request) => {
  if (req.cookies.refreshToken) return req.cookies.refreshToken;
  if (process.env.NODE_ENV === "development") return req.body.refreshToken;
  return null;
};

const handler = async (req: Request, res: Response) => {
  const refreshToken = getRefreshToken(req);

  if (!refreshToken)
    return res.status(401).json({
      error: "Invalid refresh token",
    });

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await db.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!session)
    return res.status(401).json({
      error: "Invalid refresh token",
    });

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  if (!accessTokenSecret) {
    console.error(
      "Tried to generate a JWT but no secret is defined in environment variables! Please ",
    );
    return res.status(500).json({
      error:
        "An internal server error occurred. Please contact the system administrator.",
    });
  }

  const accessToken = jwt.sign(
    { sub: session.user.id, sessionId: session.id, role: session.user.role },
    accessTokenSecret,
    { expiresIn: "15m" },
  );

  res.json({
    message: "Refresh successful.",
    accessToken,
  });
};

export default handler;
