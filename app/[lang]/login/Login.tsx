'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { emailSchema, passwordSchema } from '@/lib/inputValidation';

const schema = yup.object().shape({
  email: emailSchema,
  password: passwordSchema,
});

type FormData = yup.InferType<typeof schema>;

export default function LoginComponent({ dictionary }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setError(dictionary.errors.invalidCredentials);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(dictionary.errors.unexpectedError);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dictionary.login.title}</CardTitle>
          <CardDescription>{dictionary.login.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="email">{dictionary.login.emailLabel}</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">{dictionary.login.passwordLabel}</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              {dictionary.login.submitButton}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full">
            {dictionary.login.registerLink}{' '}
            <Link href="/register" className="text-blue-500 hover:underline">
              {dictionary.register.title}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
