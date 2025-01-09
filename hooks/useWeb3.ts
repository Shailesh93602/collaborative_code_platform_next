import { useCallback, useState, useEffect } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { CustomFile } from '@/types/global';

const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with actual deployed contract address
const CONTRACT_ABI = [
  'function saveVersion(string memory commitMessage, string[] memory filePaths, string[] memory fileContents) public',
  'function loadVersion(bytes32 versionHash) public view returns (string[] memory filePaths, string[] memory fileContents)',
  'function getAllVersions(uint256 page, uint256 perPage) public view returns (tuple(bytes32 hash, string message, uint256 timestamp)[] memory versions, uint256 total)',
  'function getConflicts() public view returns (tuple(uint256 id, uint256 sourceVersion, uint256 targetVersion)[] memory)',
  'function getTags(bytes32 versionHash) public view returns (string[] memory)',
  'function getComments(bytes32 versionHash) public view returns (tuple(address author, string content, uint256 timestamp)[] memory comments)',
  'function addTag(bytes32 versionHash, string memory tag) public',
  'function addComment(bytes32 versionHash, string memory content) public',
  'function resolveConflict(uint256 conflictId, string memory resolution) public',
  'function createBranch(string memory branchName) public',
  'function switchBranch(string memory branchName) public',
  'function getBranchNames() public view returns (string[] memory)',
  'function getCurrentBranch() public view returns (string memory)',
  'function addReviewComment(bytes32 versionHash, string memory comment, uint256 lineNumber) public',
  'function getReviewComments(bytes32 versionHash) public view returns (tuple(address author, string content, uint256 lineNumber, uint256 timestamp)[] memory)',
  'function approveVersion(bytes32 versionHash) public',
  'function rejectVersion(bytes32 versionHash) public',
  'function getKeyIdsForVersion(bytes32 versionHash) public view returns (uint256[] memory)', // Added function for keyIds
];

interface Version {
  hash: string;
  message: string;
  timestamp: number;
}

interface Conflict {
  id: number;
  sourceVersion: number;
  targetVersion: number;
}

interface Comment {
  author: string;
  content: string;
  timestamp: number;
}

interface ReviewComment {
  author: string;
  content: string;
  lineNumber: number;
  timestamp: number;
}

export function useWeb3() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [currentBranch, setCurrentBranch] = useState<string>('');

  useEffect(() => {
    const initContract = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(newContract);
      }
    };

    initContract();
  }, []);

  const saveVersion = useCallback(
    async (commitMessage: string, files: CustomFile[]) => {
      if (!contract) throw new Error('Contract not initialized');
      const filePaths = files.map((file) => file.path);
      const fileContents = files.map((file) => file.content);
      await contract.saveVersion(commitMessage, filePaths, fileContents);
    },
    [contract]
  );

  const loadVersion = useCallback(
    async (versionHash: string): Promise<CustomFile[]> => {
      if (!contract) throw new Error('Contract not initialized');
      const [filePaths, fileContents] = await contract.loadVersion(versionHash);

      // Assuming the contract returns keyIds along with filePaths and fileContents
      const keyIds = await contract.getKeyIdsForVersion(versionHash); // Replace with your contract's function

      return filePaths.map((path: string, index: number) => ({
        path,
        content: fileContents[index],
        keyId: keyIds[index], // Include keyId in the returned object
      }));
    },
    [contract]
  );

  const getAllVersions = useCallback(
    async (page: number, perPage: number): Promise<{ versions: Version[]; total: number }> => {
      if (!contract) throw new Error('Contract not initialized');
      const result = await contract.getAllVersions(page, perPage);
      const versions = result.versions.map((v: any) => ({
        hash: v.hash,
        message: v.message,
        timestamp: v.timestamp.toNumber(),
      }));
      return { versions, total: result.total.toNumber() };
    },
    [contract]
  );

  const getConflicts = useCallback(async (): Promise<Conflict[]> => {
    if (!contract) throw new Error('Contract not initialized');
    const conflicts = await contract.getConflicts();
    return conflicts.map((conflict: any) => ({
      id: conflict.id.toNumber(),
      sourceVersion: conflict.sourceVersion.toNumber(),
      targetVersion: conflict.targetVersion.toNumber(),
    }));
  }, [contract]);

  const getTags = useCallback(
    async (versionHash: string): Promise<string[]> => {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.getTags(versionHash);
    },
    [contract]
  );

  const getComments = useCallback(
    async (versionHash: string): Promise<Comment[]> => {
      if (!contract) throw new Error('Contract not initialized');
      const comments = await contract.getComments(versionHash);
      return comments.map((comment: any) => ({
        author: comment.author,
        content: comment.content,
        timestamp: comment.timestamp.toNumber(),
      }));
    },
    [contract]
  );

  const addTag = useCallback(
    async (versionHash: string, tag: string) => {
      if (!contract) throw new Error('Contract not initialized');
      await contract.addTag(versionHash, tag);
    },
    [contract]
  );

  const addComment = useCallback(
    async (versionHash: string, content: string) => {
      if (!contract) throw new Error('Contract not initialized');
      await contract.addComment(versionHash, content);
    },
    [contract]
  );

  const resolveConflict = useCallback(
    async (conflictId: number, resolution: string) => {
      if (!contract) throw new Error('Contract not initialized');
      await contract.resolveConflict(conflictId, resolution);
    },
    [contract]
  );

  const createBranch = useCallback(
    async (branchName: string) => {
      if (!contract) throw new Error('Contract not initialized');
      await contract.createBranch(branchName);
    },
    [contract]
  );

  const switchBranch = useCallback(
    async (branchName: string) => {
      if (!contract) throw new Error('Contract not initialized');
      await contract.switchBranch(branchName);
      setCurrentBranch(branchName);
    },
    [contract]
  );

  const getBranchNames = useCallback(async (): Promise<string[]> => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.getBranchNames();
  }, [contract]);

  const getCurrentBranch = useCallback(async (): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized');
    const branch = await contract.getCurrentBranch();
    setCurrentBranch(branch);
    return branch;
  }, [contract]);

  const addReviewComment = useCallback(
    async (versionHash: string, comment: string, lineNumber: number) => {
      if (!contract) throw new Error('Contract not initialized');
      await contract.addReviewComment(versionHash, comment, lineNumber);
    },
    [contract]
  );

  const getReviewComments = useCallback(
    async (versionHash: string): Promise<ReviewComment[]> => {
      if (!contract) throw new Error('Contract not initialized');
      const comments = await contract.getReviewComments(versionHash);
      return comments.map((comment: any) => ({
        author: comment.author,
        content: comment.content,
        lineNumber: comment.lineNumber.toNumber(),
        timestamp: comment.timestamp.toNumber(),
      }));
    },
    [contract]
  );

  const approveVersion = useCallback(
    async (versionHash: string) => {
      if (!contract) throw new Error('Contract not initialized');
      await contract.approveVersion(versionHash);
    },
    [contract]
  );

  const rejectVersion = useCallback(
    async (versionHash: string) => {
      if (!contract) throw new Error('Contract not initialized');
      await contract.rejectVersion(versionHash);
    },
    [contract]
  );

  return {
    saveVersion,
    loadVersion,
    getAllVersions,
    getConflicts,
    getTags,
    getComments,
    addTag,
    addComment,
    resolveConflict,
    createBranch,
    switchBranch,
    getBranchNames,
    getCurrentBranch,
    addReviewComment,
    getReviewComments,
    approveVersion,
    rejectVersion,
    currentBranch,
  };
}
