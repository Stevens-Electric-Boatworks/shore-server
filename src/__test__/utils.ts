import { Request, Response } from "express";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const mockFindFirst = db.user.findFirst as jest.Mock;
export const mockUpdate = db.user.update as jest.Mock;
export const mockBcryptCompare = bcrypt.compare as jest.Mock;
export const mockJwtSign = jwt.sign as jest.Mock;

export const mockReqRes = (body: object) => {
  const req = { body } as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return { req, res };
};

export const fakeUser = {
  id: "user-123",
  username: "alice",
  password: "hashed_password",
  role: "USER",
  refreshToken: null,
  refreshTokenCreatedAt: null,
};
