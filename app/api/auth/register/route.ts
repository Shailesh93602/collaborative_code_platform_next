import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandling';
import { createClient } from '@/services/supabase/server';

export async function POST(request: NextRequest, { params }) {
  const { lang } = await params;
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { name, email, password } = body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata.name,
      },
      message: 'User registered successfully. Please check your email to verify your account.',
    });
  } catch (error) {
    return handleApiError(error, 'An error occurred during registration', lang);
  }
}
