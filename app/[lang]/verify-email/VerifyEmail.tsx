'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { supabase } from '@/services/supabase';

export default function VerifyEmailComponent({ dictionary }) {
  const router = useRouter();

  const handleEmailVerification = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email_confirmed_at) {
      router.push('/');
    }
  };

  useEffect(() => {
    handleEmailVerification();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dictionary.verifyEmail.title}</CardTitle>
          <CardDescription>{dictionary.verifyEmail.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">{dictionary.verifyEmail.instructions}</p>
        </CardContent>
      </Card>
    </div>
  );
}
