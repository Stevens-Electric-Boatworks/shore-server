import { db } from "@/lib/db";
import { sanitizeUser } from "@/lib/sanitize";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";

async function handler(req: Request, res: Response) {
  if (!req.user)
    return res.status(500).json({
      error:
        "An internal server error has occurred. Please contact the system administrator.",
    });

  const { newPassword } = req.body;

  if (!newPassword)
    return res.status(400).json({
      error: "Input validation failed.",
      code: "BAD_INPUT",
    });

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const user = await db.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      needsPasswordReset: false,
      password: hashedPassword,
    },
  });

  if (!user)
    return res.status(500).json({
      error:
        "An internal server error has occurred. Please contact the system administrator.",
    });

  return res.json({
    message: "Password updated successfully.",
    user: sanitizeUser(user),
  });
}

export default handler;
