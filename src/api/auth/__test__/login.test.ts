import { Request, Response } from "express";
import handler from "../login";

jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PassThrough } from "stream";

const mockFindFirst = db.user.findFirst as jest.Mock;
const mockUpdate = db.user.update as jest.Mock;
const mockBcryptCompare = db.user.update as jest.Mock;
const mockJwtSign = jwt.sign as jest.Mock;

const mockReqRes = (body: object) => {
  const req = { body } as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return { req, res };
};

describe("POST /login handler", () => {
  const fakeUser = {
    id: "user-123",
    username: "alice",
    password: "hashed_password",
    role: "USER",
    refreshToken: null,
    refreshTokenCreatedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SECRET_KEY = "test-secret";
  });

  it("returns 400 if username or password is missing", async () => {
    const { req, res } = mockReqRes({ username: "alice" });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("Missing credentials"),
    });
  });

  it("returns 404 if user does not exist", async () => {
    mockFindFirst.mockResolvedValue(null);
    const { req, res } = mockReqRes({ username: "alice", password: "pass" });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  it("returns 404 if password does not match", async () => {
    mockFindFirst.mockResolvedValue(fakeUser);
    mockBcryptCompare.mockResolvedValue(false);
    const { req, res } = mockReqRes({ username: "alice", password: "pass" });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  it("returns 500 if no JWT secret is set", async () => {
    delete process.env.SECRET_KEY;
    mockFindFirst.mockResolvedValue(fakeUser);
    mockBcryptCompare.mockResolvedValue(true);
    const { req, res } = mockReqRes({ username: "alice", password: "pass" });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("internal server error"),
    });
  });

  it("returns tokens on successful login", async () => {
    mockFindFirst.mockResolvedValue(fakeUser);
    mockBcryptCompare.mockResolvedValue(true);
    mockJwtSign
      .mockReturnValueOnce("mock-access-token")
      .mockReturnValueOnce("mock-refresh-token");
    mockUpdate.mockResolvedValue({});

    const { req, res } = mockReqRes({ username: "alice", password: "pass" });
    await handler(req, res);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: fakeUser.id },
        data: expect.objectContaining({ refreshToken: "mock-refresh-token" }),
      }),
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful.",
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    });
  });
});
