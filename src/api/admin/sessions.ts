import { db } from "@/lib/db";
import express, { Request, Response } from "express";

const router = express.Router();

interface SpecificUserQuery {
  id: string;
}

interface PaginationQuery {
  cursor?: string; // ID of the last item from previous page
  limit?: string;
  order?: "asc" | "desc";
}

router.get(
  "/sessions",
  async (
    req: Request<{}, {}, {}, SpecificUserQuery & PaginationQuery>,
    res,
  ) => {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "No user specified." });

    const limit = Math.min(parseInt(req.query.limit ?? "20"), 100); // cap at 100
    const cursor = req.query.cursor;
    const order = req.query.order ?? "desc";

    const sessions = await db.session.findMany({
      where: {
        userId: id,
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: {
        lastUsedAt: order,
      },
    });

    const hasNextPage = sessions.length > limit;
    if (hasNextPage) sessions.pop(); // remove extra record

    const nextCursor = hasNextPage ? sessions.at(-1)?.id : null;

    res.json({
      data: sessions,
      pagination: {
        nextCursor,
        hasNextPage,
        limit,
      },
    });
  },
);

export default router;
