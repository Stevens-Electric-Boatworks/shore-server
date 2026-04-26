import { fakeUser, mockReqRes } from "@/__test__/utils";
import handler from "../logout";
import { db } from "@/lib/db";

const mockUpdate = db.session.update as jest.Mock;

describe("POST /logout handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 500 if the user is not set", async () => {
    const { req, res } = mockReqRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("internal server error"),
    });
  });

  it("returns 200 upon succesful logout", async () => {
    const { req, res } = mockReqRes(
      {},
      { user: fakeUser, sessionId: "mock-session-id" },
    );
    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining("Logout successful."),
    });
    expect(res.clearCookie).toHaveBeenNthCalledWith(1, "accessToken");
    expect(res.clearCookie).toHaveBeenNthCalledWith(2, "refreshToken", {
      path: "/auth/refresh",
    });
  });
});
