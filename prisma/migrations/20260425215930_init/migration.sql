-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AlarmType" AS ENUM ('ERROR', 'WARNING', 'UNKNOWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataReading" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "mc_voltage" DOUBLE PRECISION,
    "mc_thr_mv" DOUBLE PRECISION,
    "mc_motor_temp" DOUBLE PRECISION,
    "mc_motor_current" INTEGER,
    "mc_motor_torque" INTEGER,
    "mc_motor_power" INTEGER,
    "coolant_inlet_temp" DOUBLE PRECISION,
    "coolant_outlet_temp" DOUBLE PRECISION,
    "gnss_latitude" DOUBLE PRECISION,
    "gnss_longitude" DOUBLE PRECISION,
    "gnss_speed" INTEGER,
    "gnss_track" INTEGER,

    CONSTRAINT "DataReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogEntry" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "level" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "emitter" TEXT NOT NULL,
    "file" TEXT,
    "function" TEXT,
    "line" INTEGER,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionEntry" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlarmEntry" (
    "pk" SERIAL NOT NULL,
    "id" INTEGER NOT NULL,
    "type" "AlarmType" NOT NULL,
    "message" TEXT NOT NULL,
    "raisedAt" TIMESTAMP(3) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "AlarmEntry_pkey" PRIMARY KEY ("pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
