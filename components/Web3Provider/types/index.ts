import { BrowserProvider, JsonRpcSigner, Contract } from 'ethers';

export type Web3ContextType = {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  contract: Contract | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
};
