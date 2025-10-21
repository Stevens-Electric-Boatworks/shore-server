import express from "express";
import { db } from "../lib/db";
import DownloadHandler from "./download";

const router = express.Router();

router.get<{}, {}>("/", async (req, res) => {
  const readings = await db.dataReading.findMany();

  res.json({ result: readings });
});

router.get("/latest", (req, res) => {
  res.json({ latest: true });
});

router.get("/download", DownloadHandler);

export default router;
