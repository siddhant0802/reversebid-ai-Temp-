export type RuntimeErrorContext = Record<string, unknown>;

declare global {
  interface Window {
    __reversehubRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
      route?: string;
      [key: string]: unknown;
    }) => void;
  }
}

export function reportRuntimeError(error: unknown, context: RuntimeErrorContext = {}) {
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  const payload = {
    message,
    stack: error instanceof Error ? error.stack : undefined,
    filename: typeof window !== "undefined" ? window.location.pathname : "unknown",
    route: typeof window !== "undefined" ? window.location.pathname : undefined,
    ...context,
  };

  console.error("[ReverseHub AI] Runtime error:", payload);

  if (typeof window !== "undefined") {
    window.__reversehubRuntimeError?.(payload);
  }
}
