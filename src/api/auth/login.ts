import { db } from "@/lib/db";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const handler = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    if (!username || !password)
      return res.status(400).json({
        error: "Missing credentials. Please provide a username and password.",
      });

    const user = await db.user.findFirst({
      where: {
        username,
      },
    });

    if (!user) return res.status(404).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(404).json({ error: "Invalid credentials" });

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    if (!accessTokenSecret) {
      console.error(
        "Tried to generate a JWT but no access token secret is defined in environment variables!",
      );
      return res.status(500).json({
        error:
          "An internal server error occurred. Please contact the system administrator.",
      });
    }

    const sessionId = crypto.randomUUID();
    const rawRefreshToken = crypto.randomBytes(64).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawRefreshToken)
      .digest("hex");

    await db.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const accessToken = jwt.sign(
      { sub: user.id, sessionId, role: user.role },
      accessTokenSecret,
      { expiresIn: "15m" },
    );

    const isDev = process.env.NODE_ENV === "development";

    if (!isDev) {
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", rawRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({ message: "Login successful." });
    }

    // In dev, return tokens in the body so the client can use them manually
    return res.json({
      message: "Login successful.",
      accessToken,
      refreshToken: rawRefreshToken,
    });
  } catch {
    return res.status(500).json({
      error:
        "An internal server error occurred. Please contact the system administrator.",
    });
  }
};

export default handler;
