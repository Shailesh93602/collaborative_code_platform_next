import { NextResponse } from 'next/server';
import { ErrorLog } from '@/lib/errorHandling';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: Request) {
  const errorLog: ErrorLog = await request.json();

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Server-side error:', errorLog);
  }

  // Send error to Sentry
  Sentry.captureException(new Error(errorLog.message), {
    tags: { componentName: errorLog.componentName },
    extra: errorLog.additionalInfo,
  });

  // Here you could also implement additional error logging,
  // such as saving to a database or sending to another service

  return NextResponse.json({ status: 'Error logged' });
}
