import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "./types";

const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ error: "Invalid or no authentication token." });

  const secret = process.env.SECRET_KEY;

  if (!secret) {
    console.error(
      "Attempted to verify a JWT but no secret is defined in environment variables! Please ",
    );
    return res.status(500).json({
      error:
        "An internal server error occurred. Please contact the system administrator.",
    });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ error: "Invalid or no authentication token." });
    req.user = user as User;
    next();
  });
};

export default AuthMiddleware;
