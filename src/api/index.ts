import express from "express";
import { db } from "../lib/db";
import DownloadHandler from "./data/download";
import DataRouter from "./data";
import SessionRouter from "./sessions";
import AlarmsRouter from "./alarms";

const router = express.Router();

router.get<{}, {}>("/", async (req, res) => {
  const readings = await db.dataReading.findMany();

  res.json({ result: readings });
});

router.use("/data", DataRouter);
router.use("/sessions", SessionRouter);
router.use("/alarms", AlarmsRouter);
router.get("/download", DownloadHandler);

export default router;
