'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  generateEncryptionKey,
  exportKey,
  importKey,
  encryptData,
  decryptData,
} from '@/utils/encryption';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function EncryptionManager() {
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeEncryptionKey();
  }, []);

  const initializeEncryptionKey = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const key = localStorage.getItem('encryptionKey');
      if (!key) {
        const newKey = await generateEncryptionKey();
        const exportedKey = await exportKey(newKey);
        localStorage.setItem('encryptionKey', exportedKey);
        setEncryptionKey(newKey);
      } else {
        const importedKey = await importKey(key);
        setEncryptionKey(importedKey);
      }
    } catch (error) {
      console.error('Error initializing encryption key:', error);
      setError('Failed to initialize encryption key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const encrypt = useCallback(
    async (data: string): Promise<string> => {
      if (!encryptionKey) throw new Error('Encryption key not initialized');
      setIsLoading(true);
      setError(null);
      try {
        const encryptedData = await encryptData(data, encryptionKey);
        return encryptedData;
      } catch (error) {
        console.error('Error encrypting data:', error);
        setError('Failed to encrypt data. Please try again.');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [encryptionKey]
  );

  const decrypt = useCallback(
    async (encryptedData: string): Promise<string> => {
      if (!encryptionKey) throw new Error('Encryption key not initialized');
      setIsLoading(true);
      setError(null);
      try {
        const decryptedData = await decryptData(encryptedData, encryptionKey);
        return decryptedData;
      } catch (error) {
        console.error('Error decrypting data:', error);
        setError('Failed to decrypt data. Please try again.');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [encryptionKey]
  );

  const regenerateKey = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newKey = await generateEncryptionKey();
      const exportedKey = await exportKey(newKey);
      localStorage.setItem('encryptionKey', exportedKey);
      setEncryptionKey(newKey);
    } catch (error) {
      console.error('Error regenerating encryption key:', error);
      setError('Failed to regenerate encryption key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    encryptionKey,
    isLoading,
    error,
    encrypt,
    decrypt,
    regenerateKey,
  };
}

export function EncryptionStatus() {
  const { encryptionKey, isLoading, error, regenerateKey } = EncryptionManager();

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <span>Encryption Status:</span>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoading && encryptionKey && <span className="text-green-500">Active</span>}{' '}
        {!isLoading && !encryptionKey && <span className="text-red-500">Inactive</span>}
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={regenerateKey} disabled={isLoading}>
        Regenerate Encryption Key
      </Button>
    </div>
  );
}
