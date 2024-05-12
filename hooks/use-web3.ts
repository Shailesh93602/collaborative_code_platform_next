import { useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";

const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with actual deployed contract address
const CONTRACT_ABI = [
  "function saveVersion(string memory commitMessage, string memory code) public returns (bytes32)",
  "function getVersion(bytes32 hash) public view returns (string memory, string memory, uint256)",
];

export function useWeb3() {
  const getContract = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    throw new Error("Ethereum provider not found");
  }, []);

  const saveVersion = useCallback(
    async (commitMessage: string, code: string) => {
      try {
        const contract = await getContract();
        const tx = await contract.saveVersion(commitMessage, code);
        const receipt = await tx.wait();
        const versionHash = receipt.events[0].args[0];
        return {
          hash: versionHash,
          message: commitMessage,
          timestamp: Date.now(),
        };
      } catch (error) {
        console.error("Error saving version to blockchain:", error);
        throw error;
      }
    },
    [getContract]
  );

  const loadVersion = useCallback(
    async (hash: string) => {
      try {
        const contract = await getContract();
        const [commitMessage, code, timestamp] = await contract.getVersion(
          hash
        );
        return { commitMessage, code, timestamp: timestamp.toNumber() };
      } catch (error) {
        console.error("Error loading version from blockchain:", error);
        throw error;
      }
    },
    [getContract]
  );

  return { saveVersion, loadVersion };
}
