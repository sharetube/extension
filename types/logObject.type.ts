type logObject = Omit<{ [key: string]: any }, "timestamp" | "message">;

export type { logObject };
