import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

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

  if (user)
    return res.status(400).json({
      error: "User already exists.",
    });

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await db.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  return res.json({
    message: "User created successfully",
    user: {
      ...newUser,
      password: undefined, // Remove the password from the returned object
    },
  });
};

export default handler;
