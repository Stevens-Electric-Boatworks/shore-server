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
    "line" TEXT,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionEntry" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionEntry_pkey" PRIMARY KEY ("id")
);
