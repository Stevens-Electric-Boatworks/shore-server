import express, { Request, Response } from "express";
import { db } from "../lib/db";

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
    return res
      .status(400)
      .json({ error: '"from" and "to" query parameters must be numbers' });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return res
      .status(400)
      .json({ error: '"from" and "to" query parameters must be valid dates' });
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
    res.status(404).json({ error: "No records found." });
    return;
  }

  // Convert the retrieved data to CSV and send as a downloadable file
  const rows: any[] = data as any[];

  // Determine CSV headers (union of all keys in the result set)
  let headers: string[] = [];
  if (rows.length > 0) {
    const keySet = new Set<string>();
    rows.forEach((r) => {
      Object.keys(r).forEach((k) => keySet.add(k));
    });
    headers = Array.from(keySet);
  }

  const escapeValue = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (val instanceof Date) val = val.toISOString();
    else if (typeof val === "object") val = JSON.stringify(val);
    else val = String(val);

    const s = String(val);
    if (
      s.includes('"') ||
      s.includes(",") ||
      s.includes("\n") ||
      s.includes("\r")
    ) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  // Build CSV content
  const csvLines: string[] = [];
  if (headers.length > 0) {
    csvLines.push(headers.map(escapeValue).join(","));
    rows.forEach((row) => {
      const line = headers.map((h) => escapeValue((row as any)[h])).join(",");
      csvLines.push(line);
    });
  }

  const csvContent = csvLines.join("\n");

  // Create a filename using the original numeric from/to values
  const filename = `data_${from}_${to}.csv`;

  // Send as downloadable CSV
  res.set("Content-Type", "text/csv; charset=utf-8");
  res.set("Content-Disposition", `attachment; filename="${filename}"`);
  res.set("Access-Control-Expose-Headers", "Content-Disposition");
  return res.send(csvContent);
};

export default handler;
