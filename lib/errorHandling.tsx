import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

interface ErrorLogData {
  message: string;
  stack?: string;
  componentName?: string;
  additionalInfo?: Record<string, unknown>;
}

export function logError(
  error: Error | unknown,
  componentName?: string,
  additionalInfo?: Record<string, unknown>
) {
  console.log('🚀 ~ file: errorHandling.tsx:16 ~ error:', error);
  const errorData: ErrorLogData = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    componentName,
    additionalInfo,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', errorData);
  }

  // Send error to Sentry
  Sentry.captureException(error, {
    tags: { componentName },
    extra: additionalInfo,
  });

  // Here you could also implement additional error logging,
  // such as sending to a custom API endpoint or saving to a database
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <Sentry.ErrorBoundary fallback={<ErrorFallback />}>{children}</Sentry.ErrorBoundary>;
}

function ErrorFallback() {
  return (
    <div className="error-fallback">
      <h1>Oops! Something went wrong.</h1>
      <p>
        We're sorry for the inconvenience. Please try refreshing the page or contact support if the
        problem persists.
      </p>
    </div>
  );
}

export async function handleApiError(
  error: unknown,
  defaultMessage: string
): Promise<NextResponse> {
  logError(error, 'API Route'); // Log the error for debugging

  let message = defaultMessage;
  let status = 500;
  let code = 'ServerError';

  if (error instanceof Error) {
    message = error.message;

    // Check for specific error types and set status/code accordingly
    if (error.name === 'NotFoundError') {
      status = 404;
      code = 'NotFound';
    } else if (error.name === 'UnauthorizedError') {
      status = 401;
      code = 'Unauthorized';
    } else if (error.name === 'ValidationError') {
      status = 400;
      code = 'ValidationError';
    }
  }

  return NextResponse.json({ error: { code, message } }, { status });
}
