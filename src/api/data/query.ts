import express, { Request, Response } from "express";
import { db } from "../../lib/db";

const handler = async (req: Request, res: Response) => {
  const parseNumberParam = (val: any): number | undefined => {
    if (val === undefined) return undefined;
    if (Array.isArray(val)) val = val[0];
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  };

  const from = parseNumberParam(req.query.from);
  const to = parseNumberParam(req.query.to);

  if (from === undefined || to === undefined) {
    return res.status(400).json({
      status: "FAIL",
      message: '"from" and "to" query parameters must be numbers',
    });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return res.status(400).json({
      status: "FAIL",
      message: '"from" and "to" query parameters must be valid dates',
    });
  }

  const data = await db.dataReading.findMany({
    where: {
      timestamp: {
        gte: fromDate,
        lte: toDate,
      },
    },
  });

  if (data.length < 1) {
    return res.json({ status: "FAIL", message: "No records found." });
  } else {
    return res.json({ status: "OK", message: "Records exist." });
  }
};

export default handler;
