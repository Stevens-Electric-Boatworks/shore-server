import { Request, Response } from "express";

const handler = async (req: Request, res: Response) => {
  if (!req.user || !req.sessionId)
    return res.status(500).json({
      error:
        "An internal server error has occurred. Please contact the system administrator.",
    });

  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
    },
  });
};

export default handler;
