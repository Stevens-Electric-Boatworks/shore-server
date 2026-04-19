import express from "express";
import { db } from "../lib/db";
import DownloadHandler from "./data/download";
import DataRouter from "./data";
import SessionRouter from "./sessions";
import AlarmsRouter from "./alarms";
import AuthRouter from "./auth";

import AuthMiddleware from "@/auth";

const router = express.Router();

router.get<{}, {}>("/", async (req, res) => {
  const readings = await db.dataReading.findMany();

  res.json({ result: readings });
});

router.use("/data", AuthMiddleware, DataRouter);
router.use("/sessions", AuthMiddleware, SessionRouter);
router.use("/alarms", AuthMiddleware, AlarmsRouter);
router.use("/auth", AuthRouter);

router.get("/download", AuthMiddleware, DownloadHandler);

export default router;
