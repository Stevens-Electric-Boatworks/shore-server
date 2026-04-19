import { db } from "@/lib/db";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const handler = async (req: Request, res: Response) => {
  const { username, password } = req.body;

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

  const secret = process.env.SECRET_KEY;

  if (!secret) {
    console.error(
      "Tried to generate a JWT but no secret is defined in environment variables! Please ",
    );
    return res.status(500).json({
      error:
        "An internal server error occurred. Please contact the system administrator.",
    });
  }

  const accessToken = jwt.sign(
    {
      username: user.username,
      id: user.id,
      role: user.role,
    },
    secret,
    { expiresIn: "1h" },
  );

  const refreshToken = jwt.sign(
    {
      username: user.username,
    },
    secret,
    {
      expiresIn: "1d",
    },
  );

  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
      refreshTokenCreatedAt: new Date(),
    },
  });

  res.json({
    message: "Login successful.",
    accessToken,
    refreshToken,
  });
};

export default handler;
