import crypto from 'crypto';
import { promisify } from 'util';
import prisma from '@/lib/prisma.util';

const randomBytes = promisify(crypto.randomBytes);

interface EncryptionKey {
  id: string;
  key: Buffer;
  createdAt: Date;
  expiresAt: Date;
}

export async function generateEncryptionKey(): Promise<EncryptionKey> {
  const id = crypto.randomUUID();
  const key = await randomBytes(32); // 256-bit key
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  await prisma.encryptionKey.create({
    data: {
      id,
      key: key.toString('hex'),
      createdAt,
      expiresAt,
    },
  });

  return { id, key, createdAt, expiresAt };
}

export async function getLatestEncryptionKey(): Promise<EncryptionKey | null> {
  const latestKey = await prisma.encryptionKey.findFirst({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!latestKey) {
    return null;
  }

  return {
    id: latestKey.id,
    key: Buffer.from(latestKey.key, 'hex'),
    createdAt: latestKey.createdAt,
    expiresAt: latestKey.expiresAt,
  };
}

export async function rotateEncryptionKeys(): Promise<void> {
  const newKey = await generateEncryptionKey();

  // Mark all old keys as expired
  await prisma.encryptionKey.updateMany({
    where: {
      id: {
        not: newKey.id,
      },
    },
    data: {
      expiresAt: new Date(),
    },
  });
}

export async function getEncryptionKeyById(id: string): Promise<EncryptionKey | null> {
  const key = await prisma.encryptionKey.findUnique({
    where: { id },
  });

  if (!key) {
    return null;
  }

  return {
    id: key.id,
    key: Buffer.from(key.key, 'hex'),
    createdAt: key.createdAt,
    expiresAt: key.expiresAt,
  };
}
