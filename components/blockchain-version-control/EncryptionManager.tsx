import { useState, useEffect } from "react";
import {
  generateEncryptionKey,
  exportKey,
  importKey,
  encryptData,
  decryptData,
} from "@/lib/encryption.util";

export function EncryptionManager() {
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    initializeEncryptionKey();
  }, []);

  const initializeEncryptionKey = async () => {
    const key = localStorage.getItem("encryptionKey");
    if (!key) {
      const newKey = await generateEncryptionKey();
      const exportedKey = await exportKey(newKey);
      localStorage.setItem("encryptionKey", exportedKey);
      setEncryptionKey(newKey);
    } else {
      const importedKey = await importKey(key);
      setEncryptionKey(importedKey);
    }
  };

  const encrypt = async (data: string): Promise<string> => {
    if (!encryptionKey) throw new Error("Encryption key not initialized");
    return encryptData(data, encryptionKey);
  };

  const decrypt = async (encryptedData: string): Promise<string> => {
    if (!encryptionKey) throw new Error("Encryption key not initialized");
    return decryptData(encryptedData, encryptionKey);
  };

  return {
    encryptionKey,
    encryptData: encrypt,
    decryptData: decrypt,
  };
}
