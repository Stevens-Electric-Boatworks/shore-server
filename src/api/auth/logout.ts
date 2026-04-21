import { db } from "@/lib/db";
import { Request, Response } from "express";

const handler = async (req: Request, res: Response) => {
  if (!req.user)
    return res.status(500).json({
      error:
        "An internal server error has occurred. Please contact the system administrator.",
    });

  await db.session.update({
    where: { id: req.sessionId }, // sessionId from the verified access token
    data: { revokedAt: new Date() },
  });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/auth/refresh" });

  return res.json({ message: "Logout successful." });
};

export default handler;
