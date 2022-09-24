import cliProgress from "cli-progress";
import { differenceInMilliseconds, differenceInSeconds, formatDuration, intervalToDuration } from "date-fns";
import fs from "fs";
import { IncomingMessage } from "http";
import { filter, map, Observable, Subject } from "rxjs";

import { default as axios } from "axios";

export interface FileDownloadEvent {
  type: "connecting" | "connected" | "progress" | "complete" | "error";
  time: Date;
}

export interface FileDownloadConnectedEvent extends FileDownloadEvent {
  type: "connected";
  bytesTotal: number;
  contentType: string;
}
export interface FileDownloadErrorEvent extends FileDownloadEvent {
  type: "error";
  error: Error;
}

export interface FileDownloadCompleteEvent extends FileDownloadEvent {
  type: "complete";
  duration: number;
  rate: number;
  bytesTotal: number;
}

export interface ProgressEvent extends FileDownloadEvent {
  type: "progress";
  bytesTotal: number;
  bytesReceived: number;
  percent: number;
  bytesRate: number;
  eta: number;
  duration: number;
}
export interface FormattedProgressEvent extends FileDownloadEvent {
  type: "progress";
  size: string;
  received: string;
  percent: string;
  rate: string;
  timeRemaining: string;
  duration: string;
}

function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function toFormattedEvent(evt: ProgressEvent): FormattedProgressEvent {
  try {
    const eta = intervalToDuration({ start: 0, end: evt.eta * 1000 });
    const duration = intervalToDuration({ start: 0, end: evt.duration * 1000 });
    return {
      type: "progress",
      timeRemaining: formatDuration(eta, {
        format: ["hours", "minutes", "seconds"],
      }),
      duration: formatDuration(duration, {
        format: ["hours", "minutes", "seconds"],
      }),
      percent: `${Math.floor(evt.percent * 10000) / 100}%`,
      time: evt.time,
      size: formatBytes(evt.bytesTotal),
      received: formatBytes(evt.bytesReceived),
      rate: formatBytes(evt.bytesRate) + "/s",
    };
  } catch {
    return {
      type: "progress",
      timeRemaining: "",
      duration: "",
      percent: "",
      time: evt.time ?? new Date(),
      rate: "",
      received: "",
      size: "",
    };
  }
}

export class FileDownload {
  private _downloadPromise?: Promise<void>;
  private _started?: Date;
  private _progressHistory: [Date, number][] = [];
  private _events$$ = new Subject<FileDownloadEvent>();

  constructor(public readonly sourceUrl: string, public readonly filePath: string) {}

  public readonly events$ = this._events$$.asObservable();
  public readonly progress$ = this.events$.pipe(filter((e) => e.type === "progress")) as Observable<ProgressEvent>;
  public readonly progressFormatted$ = this.progress$.pipe(map(toFormattedEvent));

  public download(showProgressBar?: boolean): Promise<void> {
    let bar = showProgressBar
      ? new cliProgress.SingleBar({
          format: "{bar} {percent} - {timeRemaining} @ {rate}",
          barsize: 40,
        })
      : null;

    if (!this._downloadPromise) {
      this._started = new Date();

      this._downloadPromise = new Promise<void>(async (res, rej) => {
        this._events$$.next({
          type: "connecting",
          time: new Date(),
        });

        const response = await axios.request({
          method: "get",
          responseType: "stream",
          url: this.sourceUrl,
        });

        const bytesTotal: number = +response.headers["content-length"] ?? -1;
        let bytesReceived: number = 0;
        bar?.start(bytesTotal, 0);

        this._events$$.next({
          type: "connected",
          time: new Date(),
          contentType: response.headers["content-type"],
          bytesTotal,
        } as FileDownloadConnectedEvent);

        this._progressHistory.push([new Date(), 0]);

        const message = response.data as IncomingMessage;
        message.pipe(fs.createWriteStream(this.filePath));
        message.on("data", (data) => {
          bytesReceived += data.length;
          this._progressHistory.push([new Date(), bytesReceived]);

          const stats5Sec = this.calcProgressStats(bytesReceived, bytesTotal, 5);
          const stats30Sec = this.calcProgressStats(bytesReceived, bytesTotal, 30);

          const event = {
            ...stats30Sec,
            bytesRate: stats5Sec.bytesRate,
          } as ProgressEvent;

          this._events$$.next(event);
          bar?.update(event.bytesReceived, toFormattedEvent(event));

          this.pruneHistory();
        });
        message.on("end", () => {
          bytesReceived = bytesTotal;
          const stats5Sec = this.calcProgressStats(bytesReceived, bytesTotal, 5);
          const stats30Sec = this.calcProgressStats(bytesReceived, bytesTotal, 30);

          const event = {
            ...stats30Sec,
            bytesRate: stats5Sec.bytesRate,
          } as ProgressEvent;
          this._events$$.next(event);
          bar?.update(event.bytesReceived, toFormattedEvent(event));
          bar?.stop();
          const now = new Date();

          this._events$$.next({
            type: "complete",
            time: now,
            bytesTotal,
            rate: stats5Sec.bytesRate,
            duration: differenceInMilliseconds(now, this._started!) / 1000,
          } as FileDownloadCompleteEvent);
          this._started = undefined;
          this._progressHistory = [];
          this._downloadPromise = undefined;
          res();
        });
        message.on("error", (err) => {
          this._events$$.next({
            type: "error",
            time: new Date(),
            error: err,
          } as FileDownloadErrorEvent);
          this._started = undefined;
          this._progressHistory = [];
          this._downloadPromise = undefined;
          bar?.stop();
          rej(err);
        });
      });
    }
    return this._downloadPromise;
  }

  private pruneHistory() {
    const now = new Date();
    this._progressHistory = this._progressHistory.filter((d) => differenceInSeconds(now, d[0]) <= 30);
  }

  private calcProgressStats(loaded: number, total: number, timeSpan: number = 5): ProgressEvent {
    const now = new Date();
    const data = this._progressHistory.find((d) => differenceInSeconds(now, d[0]) <= timeSpan);
    if (data) {
      const [sTime, sBytes] = data;
      const deltaTime = differenceInMilliseconds(now, sTime);
      const deltaBytes = loaded - sBytes;
      const bytesRemaining = total - loaded;

      const rate = (deltaBytes / deltaTime) * 1000;
      const eta = bytesRemaining / rate;

      return {
        type: "progress",
        bytesRate: rate,
        bytesReceived: loaded,
        bytesTotal: total,
        eta: eta,
        percent: loaded / (total || -1),
        time: now,
        duration: differenceInMilliseconds(now, this._started!) / 1000,
      };
    } else {
      return {
        type: "progress",
        bytesRate: 0,
        bytesReceived: loaded,
        bytesTotal: total,
        eta: 0,
        percent: loaded / (total || -1),
        time: now,
        duration: differenceInMilliseconds(now, this._started!) / 1000,
      };
    }
  }
}
