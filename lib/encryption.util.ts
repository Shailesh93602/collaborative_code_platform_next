import crypto from "crypto";
import { getLatestEncryptionKey, getEncryptionKeyById } from "./keyManagement";

export async function encrypt(
  data: string
): Promise<{ encryptedData: string; keyId: string }> {
  const key = await getLatestEncryptionKey();
  if (!key) {
    throw new Error("No valid encryption key found");
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key.key, iv);
  let encryptedData = cipher.update(data, "utf8", "hex");
  encryptedData += cipher.final("hex");

  return {
    encryptedData: iv.toString("hex") + ":" + encryptedData,
    keyId: key.id,
  };
}

export async function decrypt(
  encryptedData: string,
  keyId: string
): Promise<string> {
  const key = await getEncryptionKeyById(keyId);
  if (!key) {
    throw new Error("Encryption key not found");
  }

  const [ivHex, dataHex] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key.key, iv);
  let decryptedData = decipher.update(dataHex, "hex", "utf8");
  decryptedData += decipher.final("utf8");

  return decryptedData;
}
