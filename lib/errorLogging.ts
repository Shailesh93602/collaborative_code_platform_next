import * as Sentry from "@sentry/nextjs";

export interface ErrorLog {
  message: string;
  stack?: string;
  componentName?: string;
  additionalInfo?: Record<string, unknown>;
}

export const logError = async (
  error: Error,
  componentName?: string,
  additionalInfo?: Record<string, unknown>
) => {
  const errorLog: ErrorLog = {
    message: error.message,
    stack: error.stack,
    componentName,
    additionalInfo,
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", errorLog);
  }

  // Send error to Sentry
  Sentry.captureException(error, {
    tags: { componentName },
    extra: additionalInfo,
  });

  // Send error to our custom API endpoint
  try {
    await fetch("/api/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorLog),
    });
  } catch (e) {
    console.error("Failed to send error log:", e);
  }
};
