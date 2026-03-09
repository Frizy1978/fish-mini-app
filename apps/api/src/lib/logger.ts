export const logger = {
  info(message: string, meta?: unknown) {
    console.log(`[api] ${message}`, meta ?? "");
  },
  error(message: string, meta?: unknown) {
    console.error(`[api] ${message}`, meta ?? "");
  }
};
