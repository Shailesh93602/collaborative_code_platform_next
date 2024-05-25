import { useCallback, useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";

const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with actual deployed contract address
const CONTRACT_ABI = [
  "function saveVersion(string memory commitMessage, string memory code) public returns (bytes32)",
  "function getVersion(bytes32 hash) public view returns (string memory, string memory, uint256)",
  "function getAllVersions() public view returns (bytes32[] memory)",
  "function createBranch(string memory branchName) public returns (uint256)",
  "function switchBranch(uint256 branchId) public",
  "function getCurrentBranch() public view returns (uint256)",
  "function mergeBranches(uint256 sourceBranchId, uint256 targetBranchId) public",
  "function getBranchNames() public view returns (string[] memory)",
  "function addTag(bytes32 versionHash, string memory tag) public",
  "function getTags(bytes32 versionHash) public view returns (string[] memory)",
  "function addComment(bytes32 versionHash, string memory content) public",
  "function getComments(bytes32 versionHash) public view returns (tuple(address author, string content, uint256 timestamp)[] memory)",
];

export function useWeb3() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [currentBranch, setCurrentBranch] = useState<number>(0);

  const initializeContract = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const newContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(newContract);
      const branch = await newContract.getCurrentBranch();
      setCurrentBranch(branch.toNumber());
    } else {
      throw new Error("Ethereum provider not found");
    }
  }, []);

  useEffect(() => {
    initializeContract();
  }, [initializeContract]);

  const saveVersion = useCallback(
    async (commitMessage: string, code: string) => {
      if (!contract) throw new Error("Contract not initialized");
      try {
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
    [contract]
  );

  const loadVersion = useCallback(
    async (hash: string) => {
      if (!contract) throw new Error("Contract not initialized");
      try {
        const [commitMessage, code, timestamp] = await contract.getVersion(
          hash
        );
        return { commitMessage, code, timestamp: timestamp.toNumber() };
      } catch (error) {
        console.error("Error loading version from blockchain:", error);
        throw error;
      }
    },
    [contract]
  );

  const getAllVersions = useCallback(
    async (searchQuery?: string) => {
      console.log(searchQuery);
      if (!contract) throw new Error("Contract not initialized");
      try {
        const versionHashes = await contract.getAllVersions();
        const versions = await Promise.all(
          versionHashes.map(async (hash: string) => {
            const { commitMessage, timestamp } = await contract.getVersion(
              hash
            );
            return {
              hash,
              message: commitMessage,
              timestamp: timestamp.toNumber(),
            };
          })
        );
        return versions;
      } catch (error) {
        console.error("Error fetching all versions from blockchain:", error);
        throw error;
      }
    },
    [contract]
  );

  const createBranch = useCallback(
    async (branchName: string) => {
      if (!contract) throw new Error("Contract not initialized");
      try {
        const tx = await contract.createBranch(branchName);
        const receipt = await tx.wait();
        const branchId = receipt.events[0].args[0];
        return branchId.toNumber();
      } catch (error) {
        console.error("Error creating branch:", error);
        throw error;
      }
    },
    [contract]
  );

  const switchBranch = useCallback(
    async (branchId: number) => {
      if (!contract) throw new Error("Contract not initialized");
      try {
        await contract.switchBranch(branchId);
        setCurrentBranch(branchId);
      } catch (error) {
        console.error("Error switching branch:", error);
        throw error;
      }
    },
    [contract]
  );

  const mergeBranches = useCallback(
    async (sourceBranchId: number, targetBranchId: number) => {
      if (!contract) throw new Error("Contract not initialized");
      try {
        const tx = await contract.mergeBranches(sourceBranchId, targetBranchId);
        await tx.wait();
      } catch (error) {
        console.error("Error merging branches:", error);
        throw error;
      }
    },
    [contract]
  );

  const getBranchNames = useCallback(async () => {
    if (!contract) throw new Error("Contract not initialized");
    try {
      const names = await contract.getBranchNames();
      return names;
    } catch (error) {
      console.error("Error fetching branch names:", error);
      throw error;
    }
  }, [contract]);

  const addTag = useCallback(
    async (versionHash: string, tag: string) => {
      if (!contract) throw new Error("Contract not initialized");
      try {
        const tx = await contract.addTag(versionHash, tag);
        await tx.wait();
      } catch (error) {
        console.error("Error adding tag:", error);
        throw error;
      }
    },
    [contract]
  );

  const getTags = useCallback(
    async (versionHash: string) => {
      if (!contract) throw new Error("Contract not initialized");
      try {
        const tags = await contract.getTags(versionHash);
        return tags;
      } catch (error) {
        console.error("Error getting tags:", error);
        throw error;
      }
    },
    [contract]
  );

  const addComment = useCallback(
    async (versionHash: string, content: string) => {
      if (!contract) throw new Error("Contract not initialized");
      try {
        const tx = await contract.addComment(versionHash, content);
        await tx.wait();
      } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
      }
    },
    [contract]
  );

  const getComments = useCallback(
    async (versionHash: string) => {
      if (!contract) throw new Error("Contract not initialized");
      try {
        const comments = await contract.getComments(versionHash);
        return comments.map((comment: any) => ({
          author: comment.author,
          content: comment.content,
          timestamp: comment.timestamp.toNumber(),
        }));
      } catch (error) {
        console.error("Error getting comments:", error);
        throw error;
      }
    },
    [contract]
  );

  return {
    saveVersion,
    loadVersion,
    getAllVersions,
    searchVersions: getAllVersions,
    resolveConflict: async (conflictId: string, resolvedCode: string) => {
      console.log("Resolve Conflicts", conflictId, resolvedCode);
    },
    createBranch,
    switchBranch,
    mergeBranches,
    getBranchNames,
    currentBranch,
    addTag,
    getTags,
    addComment,
    getComments,
  };
}
