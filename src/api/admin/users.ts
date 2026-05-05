import { db } from "@/lib/db";
import express from "express";
import { Request } from "express";
import z, { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { sanitizeUser } from "@/lib/sanitize";

const router = express.Router();

interface PaginationQuery {
  cursor?: string; // ID of the last item from previous page
  limit?: string;
  order?: "asc" | "desc";
}

interface SpecificUserQuery {
  id: string;
}

router.put("/user", async (req, res) => {
  const schema = z.object({
    username: z.string().min(3),
    password: z.string().min(8),
    role: z.enum(["USER", "ADMIN"]),
  });

  const { username, password, role } = req.body;

  try {
    schema.parse(req.body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: "Input validation failed",
      });
    }
  }

  const existingUser = await db.user.findFirst({
    where: { username },
  });

  if (existingUser)
    return res.status(400).json({
      error: "User already exists",
    });

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await db.user.create({
    data: {
      username,
      password: hashedPassword,
      role,
      needsPasswordReset: true,
    },
  });

  return res.json({
    message: "User created successfully",
    user: {
      ...newUser,
      password: undefined,
    },
  });
});

router.post("/user/:id", async (req, res) => {
  const id = req.params.id;

  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user)
    return res.status(404).json({
      error: "Resource not found",
      code: "NOT_FOUND",
    });

  // Must have active key equal to false
  if (req.body.active === false) {
    if (user.role === "ADMIN")
      return res.status(400).json({
        error:
          "You cannot deactivate another admin user. Please consult the database administrator for more information.",
        code: "BAD_INPUT",
      });

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return res.json({
      message: "User deactivated successfully",
      user: sanitizeUser(updatedUser),
    });
  }

  return res.status(400).json({
    error: "No operation specified",
    code: "BAD_INPUT",
  });
});

router.get(
  "/user",
  async (req: Request<{}, {}, {}, SpecificUserQuery>, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "No user specified." });

    const user = await db.user.findUnique({
      where: {
        id,
      },
    });

    const { password, ...sanitized } = user!;

    res.json({
      data: sanitized,
    });
  },
);

router.get("/users", async (req: Request<{}, {}, {}, PaginationQuery>, res) => {
  const limit = Math.min(parseInt(req.query.limit ?? "20"), 100); // cap at 100
  const cursor = req.query.cursor;
  const order = req.query.order ?? "desc";

  const users = await db.user.findMany({
    where: {
      deletedAt: null,
    },
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    orderBy: {
      username: order,
    },
  });

  const hasNextPage = users.length > limit;
  if (hasNextPage) users.pop(); // remove extra record

  const nextCursor = hasNextPage ? users.at(-1)?.id : null;

  const sanitized = users.map(({ password, ...rest }) => rest);

  res.json({
    data: sanitized,
    pagination: {
      nextCursor,
      hasNextPage,
      limit,
    },
  });
});

export default router;
