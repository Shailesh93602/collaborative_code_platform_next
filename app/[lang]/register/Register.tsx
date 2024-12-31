'use client';

import React, { useState } from 'react';
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
import { nameSchema, emailSchema, passwordSchema } from '@/lib/inputValidation';

const schema = yup.object().shape({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'errors.passwordMismatch')
    .required('Confirm password is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function RegisterComponent({ dictionary }) {
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
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError(dictionary.errors.emailAlreadyInUse);
        } else {
          setError(error.message);
        }
      } else {
        router.push('/verify-email');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(dictionary.errors.unexpectedError);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dictionary.register.title}</CardTitle>
          <CardDescription>{dictionary.register.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="name">{dictionary.register.nameLabel}</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">{dictionary.register.emailLabel}</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">{dictionary.register.passwordLabel}</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">{dictionary.register?.confirmPasswordLabel}</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {dictionary?.errors?.confirmPassword?.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              {dictionary.register.submitButton}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full">
            {dictionary.register.loginLink}
            <Link href="/login" className="text-blue-500 hover:underline">
              {dictionary.login.title}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
