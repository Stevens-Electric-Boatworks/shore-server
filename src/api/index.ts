import express from "express";
import { db } from "../lib/db";
import { read } from "fs";

const router = express.Router();

router.get<{}, {}>("/", async (req, res) => {
  const readings = await db.dataReading.findMany();

  res.json({ result: readings });
});

router.get("/latest", (req, res) => {
  res.json({ latest: true });
});

export default router;
