import { Buffer } from 'buffer';

// Generate a new encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export the encryption key as a base64 string
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return Buffer.from(exported).toString('base64');
}

// Import an encryption key from a base64 string
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = Buffer.from(keyString, 'base64');
  return await window.crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data
export async function encryptData(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );

  const encryptedArray = new Uint8Array(encryptedData);
  const resultBuffer = new Uint8Array(iv.length + encryptedArray.length);
  resultBuffer.set(iv, 0);
  resultBuffer.set(encryptedArray, iv.length);

  return Buffer.from(resultBuffer).toString('base64');
}

// Decrypt data
export async function decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
  const dataBuffer = Buffer.from(encryptedData, 'base64');
  const iv = dataBuffer.slice(0, 12);
  const data = dataBuffer.slice(12);

  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}
