import { Request, Response } from "express";
import handler from "../login";
import {
  fakeUser,
  mockBcryptCompare,
  mockFindFirst,
  mockJwtSign,
  mockRandomBytes,
  mockRandomUuid,
  mockReqRes,
  mockUpdate,
} from "@/__test__/utils";
import { db } from "@/lib/db";

describe("POST /login handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = "test-secret";
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
    delete process.env.ACCESS_TOKEN_SECRET;
    mockFindFirst.mockResolvedValue(fakeUser);
    mockBcryptCompare.mockResolvedValue(true);
    const { req, res } = mockReqRes({ username: "alice", password: "pass" });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("internal server error"),
    });
  });

  it("returns tokens upon successful login as cookies in production", async () => {
    mockFindFirst.mockResolvedValue(fakeUser);
    mockBcryptCompare.mockResolvedValue(true);
    mockRandomUuid.mockReturnValue("mock-session-id");
    mockRandomBytes.mockReturnValue("mock-refresh-token");
    mockJwtSign.mockReturnValueOnce("mock-access-token");

    const mockSessionCreate = db.session.create as jest.Mock;

    const { req, res } = mockReqRes(
      { username: "alice", password: "pass" },
      { headers: { "user-agent": "mock-user-agent" }, ip: "mock-ip-addr" },
    );
    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful.",
    });
    expect(res.cookie).toHaveBeenNthCalledWith(
      1,
      "accessToken",
      "mock-access-token",
      expect.objectContaining({
        httpOnly: true,
      }),
    );
    expect(res.cookie).toHaveBeenNthCalledWith(
      2,
      "refreshToken",
      "mock-refresh-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/auth/refresh",
      }),
    );
    expect(mockSessionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: "mock-session-id",
        userId: fakeUser.id,
      }),
    });
  });
});
