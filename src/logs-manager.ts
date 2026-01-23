import { db } from "./lib/db";

export type LogEntry = {
  timestamp: Date;
  level: number;
  message: string;
  emitter: string;
  file?: string;
  function?: string;
  line?: number;
};

const MAX_ENTRIES = 10000;

export class LogsManager {
  private buffer: LogEntry[] = [];
  private lastUploaded: LogEntry | null = null;

  // Total number of logs this session, surpassing the maximum number stored in the buffer
  private totalCount: number = 0;

  /**
   * Push an array of logs to the log buffer.
   * @param logs Array of logs to push.
   * @returns Number of logs truncated from the end of the buffer.
   */
  public pushLogs(logs: LogEntry[]) {
    this.totalCount += logs.length;
    logs.forEach((e) => this.buffer.push(e));
  }

  /**
   * Returns
   */
  public getLogs() {
    return this.buffer;
  }

  /**
   * Returns the total number of logs this session.
   */
  public getCount() {
    return this.totalCount;
  }

  /**
   * Returns the total number of logs that have been truncated from the end of the buffer.
   * If this number is `0`, no logs have been truncated from the end of buffer.
   */
  public getTruncatedCount() {
    return this.totalCount - this.buffer.length;
  }

  /**
   * Upload new logs to the database. Internally, the LogsManager class stores a pointer to the
   * last log uploaded successfully. It then uploads all logs in the buffer that are after this one.
   * @returns Number of logs successfully uploaded to database.
   */
  public async upload() {
    if (this.lastUploaded == this.buffer[this.buffer.length - 1]) return;
    if (!this.lastUploaded) {
      // If this is the first time we are uploading logs, upload all of them
      console.log(
        `[INFO:] Uploading ${this.buffer.length} logs to database...`,
      );
      await db.logEntry.createMany({
        data: this.buffer,
      });
    } else {
      const lastUploadedIndex = this.buffer.findIndex(
        (e) => e === this.lastUploaded,
      );

      const takeCount = this.buffer.length - lastUploadedIndex - 1;
      console.log(`[INFO:] Uploading ${takeCount} logs to database...`);

      await db.logEntry.createMany({
        data: this.buffer.slice(-takeCount),
      });
    }

    this.lastUploaded = this.buffer[this.buffer.length - 1];
  }
}
