"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

type Web3ContextType = {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
};

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
});

export function Web3Provider({ children }: { readonly children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  useEffect(() => {
    // Check if the browser supports Ethereum
    if (typeof window.ethereum !== "undefined") {
      const web3Provider = new BrowserProvider(window.ethereum);

      // Set the provider
      setProvider(web3Provider);

      // Fetch and set the signer asynchronously
      web3Provider
        .getSigner()
        .then(setSigner)
        .catch((error) => {
          console.error("Error fetching signer:", error);
        });
    } else {
      console.warn(
        "Ethereum object not found. Install MetaMask or another wallet."
      );
    }
  }, []);

  return (
    <Web3Context.Provider value={{ provider, signer }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3Context = () => useContext(Web3Context);
