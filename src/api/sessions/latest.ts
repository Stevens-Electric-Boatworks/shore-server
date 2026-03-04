import { Request, Response } from "express";
import appState from "../../app-state";
import { db } from "../../lib/db";

const handler = async (req: Request, res: Response) => {
  const latestSessionStart = appState.currentSession?.startTime;

  if (!latestSessionStart) return res.json({ message: "No sessions." });
};

export default handler;
