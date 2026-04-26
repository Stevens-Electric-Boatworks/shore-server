import { fakeUser, mockJwtSign, mockReqRes } from "@/__test__/utils";
import handler from "../refresh";
import { db } from "@/lib/db";

const mockFindUnique = db.session.findUnique as jest.Mock;

describe("POST /refresh handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = "access-token-secret";
  });

  it("returns 401 if no refresh token is provided", async () => {
    const { req, res } = mockReqRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("Invalid refresh token"),
    });
  });

  it("returns 401 if refresh token is invalid", async () => {
    const { req, res } = mockReqRes(
      {},
      {
        cookies: {
          refreshToken: "invalid-refresh-token",
        },
      },
    );
    mockFindUnique.mockResolvedValue(null);
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("Invalid refresh token"),
    });
  });

  it("returns 500 if no JWT secret is set", async () => {
    const { req, res } = mockReqRes(
      {},
      {
        cookies: {
          refreshToken: "mock-refresh-token",
        },
      },
    );
    mockFindUnique.mockResolvedValue({
      id: "session-id",
      tokenHash: "refresh-token-hash",
      user: fakeUser,
    });
    delete process.env.ACCESS_TOKEN_SECRET;
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("internal server error"),
    });
  });

  it("returns new access token upon successful refresh", async () => {
    mockJwtSign.mockReturnValue("mock-access-token");
    const { req, res } = mockReqRes(
      {},
      {
        cookies: {
          refreshToken: "mock-refresh-token",
        },
      },
    );
    mockFindUnique.mockResolvedValue({
      id: "session-id",
      tokenHash: "refresh-token-hash",
      user: fakeUser,
    });
    await handler(req, res);

    expect(mockJwtSign).toHaveBeenCalledWith(
      {
        sub: fakeUser.id,
        sessionId: "session-id",
        role: fakeUser.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Refresh successful.",
      accessToken: "mock-access-token",
    });
  });
});
