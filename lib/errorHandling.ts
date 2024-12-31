import { getDictionary } from '@/get-dictionaries';
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

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

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', errorLog);
  }

  Sentry.captureException(error, {
    tags: { componentName },
    extra: additionalInfo,
  });

  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorLog),
    });
  } catch (e) {
    console.error('Failed to send error log:', e);
  }
};

export async function handleApiError(
  error: any,
  defaultMessage: string,
  lang?: 'en' | 'hi' | 'gu'
) {
  const dictionary = await getDictionary(lang ?? 'en');
  logError(error instanceof Error ? error : new Error(String(error)));

  if (error instanceof Error) {
    return NextResponse.json({
      error: {
        code: 'somethingWentWrong',
        message: dictionary?.errors?.apiError?.replace('{{message}}', error.message),
      },
      status: 400,
    });
  }

  return NextResponse.json({
    error: {
      code: error?.code,
      message: dictionary?.errors?.defaultError?.replace('{{message', defaultMessage),
    },
    status: 500,
  });
}
