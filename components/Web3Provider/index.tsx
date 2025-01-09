'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner, Contract } from 'ethers';
import { useToast } from '@/hooks/useToast';

import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contractConfig';
import { Web3ContextType } from './types';

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  contract: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnected: false,
  address: null,
  chainId: null,
});

export function Web3Provider({ children }: { readonly children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const web3Provider = new BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      // Listen for chain changes
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      web3Provider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          handleAccountsChanged(accounts as any);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      disconnectWallet();
    } else {
      setAddress(accounts[0]);
      setIsConnected(true);
      if (provider) {
        const newSigner = await provider.getSigner();
        setSigner(newSigner);
        const newContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner);
        setContract(newContract);
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
      }
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
    window.location.reload();
  };

  const connectWallet = async () => {
    if (provider) {
      try {
        await provider.send('eth_requestAccounts', []);
        const accounts = await provider.listAccounts();
        await handleAccountsChanged(accounts.map((a) => a.address));
        toast({
          title: 'Wallet Connected',
          description: 'Your wallet has been successfully connected.',
        });
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        toast({
          title: 'Connection Failed',
          description: 'Failed to connect your wallet. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'No Provider',
        description: 'Please install MetaMask or another Ethereum wallet.',
        variant: 'destructive',
      });
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setSigner(null);
    setContract(null);
    setChainId(null);
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    });
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        connectWallet,
        disconnectWallet,
        isConnected,
        address,
        chainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3Context = () => useContext(Web3Context);
