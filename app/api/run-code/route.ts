import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandling';
import { createClient } from '@/services/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email, password } = body;

    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.user_metadata.name,
      },
      message: 'User registered successfully. Please check your email to verify your account.',
    });
  } catch (error) {
    return handleApiError(error, 'An error occurred during registration');
  }
}
