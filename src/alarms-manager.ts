import appState from "./app-state";
import { db } from "./lib/db";

export type AlarmType = "ERROR" | "WARNING" | "UNKNOWN";

export type AlarmEntry = {
  id: number;
  type: AlarmType;
  message: string;
  raisedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
};

const MAX_ENTRIES = 10000;

export class AlarmsManager {
  private buffer: AlarmEntry[] = [];
  private lastUploaded: AlarmEntry | null = null;

  // Total number of alarms this session, surpassing the maximum number stored in the buffer
  private totalCount: number = 0;

  /**
   * Push an alarm to the alarms buffer.
   * @param alarm The alarm to push.
   * @returns Number of alarms truncated from the end of the buffer.
   */
  public pushAlarm(alarm: AlarmEntry) {
    this.buffer.push(alarm);
  }

  /**
   * Acknowledge alarms of a given ID. NOTE: If there are multiple alarms
   * with the same ID, this function will acknowledge all of them.
   * @param id The ID of the alarm to acknowledge.
   */
  public acknowledgeAlarm(id: number) {
    const now = new Date();
    this.buffer
      .filter((e) => e.id == id)
      .filter((e) => !e.acknowledgedAt || !e.resolvedAt)
      .forEach((e) => {
        db.alarmEntry.updateManyAndReturn({
          where: {
            ...e,
          },
          data: {
            acknowledgedAt: now,
          },
        });
        e.acknowledgedAt = now;
      });
    // Only pick alarms that are:
    // - from this session
    // - not acknowledged yet
    // - not resolved yet
  }

  /**
   * Resolve alarms of a given ID. NOTE: If there are multiple alarms
   * with the same ID, this function will resolve all of them.
   * @param id The ID of the alarm to resolve.
   */
  public resolveAlarm(id: number) {
    const now = new Date();
    this.buffer
      .filter((e) => e.id == id)
      .filter((e) => !e.resolvedAt)
      .forEach((e) => {
        db.alarmEntry.updateMany({
          where: {
            ...e,
          },
          data: {
            resolvedAt: now,
          },
        });
        e.resolvedAt = now;
      });
    // Only pick alarms that are:
    // - from this session
    // - not resolved yet
  }

  /**
   * Returns list of currently active alarms.
   */
  public getAlarms() {
    return this.buffer;
  }

  /**
   * Returns the total number of alarms this session.
   */
  public getCount() {
    return this.totalCount;
  }

  /**
   * Returns the total number of alarms that have been truncated from the end of the buffer.
   * If this number is `0`, no alarms have been truncated from the end of buffer.
   */
  public getTruncatedCount() {
    return this.totalCount - this.buffer.length;
  }

  /**
   * Upload new alarms to the database. Internally, the AlarmsManager class stores a reference to the
   * last alarms uploaded successfully. It then uploads all alarms in the buffer that are after this one.
   * @returns Number of alarms successfully uploaded to database.
   */
  public async upload() {
    if (this.lastUploaded == this.buffer[this.buffer.length - 1]) return;
    if (!this.lastUploaded) {
      // If this is the first time we are uploading alarms, upload all of them
      console.log(
        `[INFO:] Uploading ${this.buffer.length} alarms to database...`,
      );
      await db.alarmEntry.createMany({
        data: this.buffer,
      });
    } else {
      const lastUploadedIndex = this.buffer.findIndex(
        (e) => e === this.lastUploaded,
      );

      const takeCount = this.buffer.length - lastUploadedIndex - 1;
      console.log(`[INFO:] Uploading ${takeCount} alarms to database...`);

      await db.alarmEntry.createMany({
        data: this.buffer.slice(-takeCount),
      });
    }

    this.lastUploaded = this.buffer[this.buffer.length - 1];
  }
}
