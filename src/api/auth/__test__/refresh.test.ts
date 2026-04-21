import { fakeUser, mockJwtSign, mockReqRes } from "@/__test__/utils";
import handler from "../refresh";

describe("POST /refresh handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SECRET_KEY = "secret-key";
  });

  it("returns 500 if the route was reached without a user set by middleware", async () => {
    const { req, res } = mockReqRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("internal server error"),
    });
  });

  it("returns 500 if no JWT secret is set", async () => {
    const { req, res } = mockReqRes({}, { user: fakeUser });
    delete process.env.SECRET_KEY;
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("internal server error"),
    });
  });

  it("returns new access token upon successful refresh", async () => {
    mockJwtSign.mockReturnValue("mock-access-token");
    const { req, res } = mockReqRes({}, { user: fakeUser });
    await handler(req, res);

    expect(mockJwtSign).toHaveBeenCalledWith(
      {
        username: fakeUser.username,
        id: fakeUser.id,
        role: fakeUser.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" },
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Refresh successful.",
      accessToken: "mock-access-token",
    });
  });
});
