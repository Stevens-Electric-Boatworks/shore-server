import { Request, Response } from "express";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "@/types";

export const mockFindFirst = db.user.findFirst as jest.Mock;
export const mockCreate = db.user.create as jest.Mock;
export const mockUpdate = db.user.update as jest.Mock;
export const mockBcryptCompare = bcrypt.compare as jest.Mock;
export const mockBcryptHash = bcrypt.hash as jest.Mock;
export const mockJwtSign = jwt.sign as jest.Mock;

export const mockRandomUuid = crypto.randomUUID as jest.Mock;
export const mockRandomBytes = crypto.randomBytes as jest.Mock;

export const mockReqRes = (body?: object, extras: Partial<Request> = {}) => {
  const req = { body, ...extras } as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return { req, res };
};

export const fakeUser: User = {
  id: "user-123",
  username: "alice",
  password: "hashed_password",
  role: "USER",
  refreshToken: undefined,
  refreshTokenCreatedAt: undefined,
};
