import { NextRequest, NextResponse } from 'next/server';
import * as yup from 'yup';
import { sign } from 'jsonwebtoken';
import { validateAndSanitizeInput, emailSchema, passwordSchema } from '@/lib/inputValidation';
import { handleApiError } from '@/lib/errorHandling';
import { getDictionary } from '@/get-dictionaries';
import { createClient } from '@/services/supabase/server';

const loginSchema = yup.object().shape({
  email: emailSchema,
  password: passwordSchema,
});

export async function POST(request: NextRequest, { params }) {
  const { lang } = await params;
  try {
    const supabase = await createClient();
    const dictionary = await getDictionary(lang);
    const body = await request.json();
    const validatedData = await validateAndSanitizeInput(
      loginSchema,
      body,
      dictionary?.inputValidation
    );

    const { email, password } = validatedData;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        {
          error: {
            code: 'InvalidCredentials',
            message: dictionary?.auth.errors?.invalidCredentials,
          },
        },
        { status: 400 }
      );
    }

    const token = sign({ userId: data.user.id }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    return NextResponse.json({
      token,
      user: { id: data.user.id, email: data.user.email },
    });
  } catch (error) {
    return handleApiError(error, 'An error occurred during login', lang);
  }
}
