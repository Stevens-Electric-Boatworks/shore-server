import express from "express";

import UsersRouter from "./users";
import SessionsRouter from "./sessions";

const router = express.Router();

// Custom middleware that only allows admins to access these routes
router.use(async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized." });
  if (req.user.role !== "ADMIN")
    return res.status(401).json({ error: "Unauthorized." });
  next();
});

router.use(UsersRouter);
router.use(SessionsRouter);

export default router;
