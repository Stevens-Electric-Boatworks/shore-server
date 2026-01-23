import express, { Request, Response } from "express";
import { db } from "../../lib/db";

const router = express.Router();

const handler = async (req: Request, res: Response) => {
  return res.json({
    dataReading: db.dataReading.fields,
  });
};

export default handler;
