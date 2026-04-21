import {
  fakeUser,
  mockBcryptHash,
  mockCreate,
  mockFindFirst,
  mockReqRes,
} from "@/__test__/utils";
import handler from "../register";

describe("POST /register handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SECRET_KEY = "secret-key";
  });

  it("returns 400 if username is missing", async () => {
    const { req, res } = mockReqRes({ username: "alice" });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("Missing credentials"),
    });
  });

  it("returns 400 if password is missing", async () => {
    const { req, res } = mockReqRes({ password: "pass" });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("Missing credentials"),
    });
  });

  it("returns 400 if username already exists", async () => {
    mockFindFirst.mockResolvedValue(fakeUser);
    const { req, res } = mockReqRes({ username: "alice", password: "pass" });
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("User already exists."),
    });
  });

  it("returns user details upon successful registration", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockBcryptHash.mockResolvedValue("hashed-password");
    mockCreate.mockResolvedValue(fakeUser);
    const { req, res } = mockReqRes({ username: "alice", password: "pass" });
    await handler(req, res);

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        username: fakeUser.username,
        password: "hashed-password",
      }),
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "User created successfully",
      user: expect.objectContaining({
        username: fakeUser.username,
        id: fakeUser.id,
        role: fakeUser.role,
        refreshToken: fakeUser.refreshToken,
      }),
    });
    expect(res.json).not.toHaveProperty("user.password");
  });
});
