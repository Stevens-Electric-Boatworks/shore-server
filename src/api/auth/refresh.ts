import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const handler = async (req: Request, res: Response) => {
  if (!req.user)
    return res.status(500).json({
      error:
        "An internal server error has occurred. Please contact the system administrator.",
    });

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
      username: req.user.username,
      id: req.user.id,
      role: req.user.role,
    },
    secret,
    { expiresIn: "1h" },
  );

  res.json({
    message: "Refresh successful.",
    accessToken,
  });
};

export default handler;
