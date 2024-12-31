'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

export default function TwoFactorAuth() {
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const enable2FA = async () => {
    try {
      const response = await fetch('/api/auth/enable-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSecret(data.secret);
        setQrCode(data.qrCode);
      } else {
        setError('Failed to enable 2FA. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const verify2FA = async () => {
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setSuccess('2FA enabled successfully!');
        setSecret(null);
        setQrCode(null);
        setToken('');
      } else {
        setError('Invalid token. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Enhance your account security with 2FA</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="default" className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {!secret && !qrCode && <Button onClick={enable2FA}>Enable 2FA</Button>}
        {secret && qrCode && (
          <div className="space-y-4">
            <p>Scan this QR code with your authenticator app:</p>
            <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
            <p>Or enter this secret manually: {secret}</p>
            <Input
              type="text"
              placeholder="Enter 2FA token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button onClick={verify2FA}>Verify and Enable 2FA</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
