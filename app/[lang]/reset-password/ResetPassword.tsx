'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/services/supabase';
import { emailSchema } from '@/lib/inputValidation';

const schema = yup.object().shape({
  email: emailSchema,
});

type FormData = yup.InferType<typeof schema>;

export default function ResetPasswordComponent({ dictionary }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email);

      if (error) {
        setError(error.message);
      } else {
        setSuccess(dictionary.resetPassword.successMessage);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(dictionary.errors.unexpectedError);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dictionary.resetPassword.title}</CardTitle>
          <CardDescription>{dictionary.resetPassword.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="email">{dictionary.resetPassword.emailLabel}</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full">
              {dictionary.resetPassword.submitButton}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
