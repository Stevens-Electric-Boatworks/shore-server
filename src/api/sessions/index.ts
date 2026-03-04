import { db } from "@/lib/db";
import express, { Request } from "express";

const router = express.Router();

interface PaginationQuery {
  cursor?: string; // ID of the last item from previous page
  limit?: string;
  order?: "asc" | "desc";
}

router.get("/", async (req: Request<{}, {}, {}, PaginationQuery>, res) => {
  const limit = Math.min(parseInt(req.query.limit ?? "20"), 100); // cap at 100
  const cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
  const order = req.query.order ?? "desc";

  const sessions = await db.sessionEntry.findMany({
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // skip the cursor item itself
    }),
    orderBy: { startTime: order },
  });

  const hasNextPage = sessions.length > limit;
  if (hasNextPage) sessions.pop(); // remove the extra item

  const nextCursor = hasNextPage ? sessions.at(-1)?.id : null;

  res.json({
    data: sessions,
    pagination: {
      nextCursor, // pass this as ?cursor= in the next request
      hasNextPage,
      limit,
    },
  });
});

export default router;
