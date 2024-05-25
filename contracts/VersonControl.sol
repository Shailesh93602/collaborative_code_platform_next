// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VersionControl {
    struct Version {
        string commitMessage;
        string code;
        uint256 timestamp;
        bytes32 parent;
        string[] tags;
        Comment[] comments;
    }

    struct Branch {
        string name;
        bytes32[] versions;
    }

    struct Conflict {
        bytes32 sourceVersion;
        bytes32 targetVersion;
        bool resolved;
    }

    struct Comment {
        address author;
        string content;
        uint256 timestamp;
    }

    mapping(bytes32 => Version) public versions;
    mapping(uint256 => Branch) public branches;
    mapping(bytes32 => Conflict) public conflicts;
    uint256 public branchCount;
    uint256 public currentBranch;

    event VersionSaved(bytes32 indexed versionHash, uint256 indexed branchId);
    event BranchCreated(uint256 indexed branchId, string name);
    event BranchSwitched(uint256 indexed branchId);
    event BranchMerged(uint256 indexed sourceBranchId, uint256 indexed targetBranchId);
    event ConflictDetected(bytes32 indexed conflictId, bytes32 sourceVersion, bytes32 targetVersion);
    event ConflictResolved(bytes32 indexed conflictId);
    event VersionTagged(bytes32 indexed versionHash, string tag);
    event CommentAdded(bytes32 indexed versionHash, address indexed author, string content);

    constructor() {
        createBranch("main");
        currentBranch = 0;
    }

    function saveVersion(string memory commitMessage, string memory code) public returns (bytes32) {
        bytes32 parentHash = branches[currentBranch].versions.length > 0 
            ? branches[currentBranch].versions[branches[currentBranch].versions.length - 1] 
            : bytes32(0);
        bytes32 versionHash = keccak256(abi.encodePacked(commitMessage, code, block.timestamp, parentHash));
        versions[versionHash] = Version(commitMessage, code, block.timestamp, parentHash, new string[](0), new Comment[](0));
        branches[currentBranch].versions.push(versionHash);
        emit VersionSaved(versionHash, currentBranch);
        return versionHash;
    }

    function getVersion(bytes32 hash) public view returns (string memory, string memory, uint256, bytes32, string[] memory) {
        Version memory v = versions[hash];
        return (v.commitMessage, v.code, v.timestamp, v.parent, v.tags);
    }

    function getAllVersions() public view returns (bytes32[] memory) {
        return branches[currentBranch].versions;
    }

    function createBranch(string memory branchName) public returns (uint256) {
        uint256 branchId = branchCount++;
        branches[branchId] = Branch(branchName, new bytes32[](0));
        emit BranchCreated(branchId, branchName);
        return branchId;
    }

    function switchBranch(uint256 branchId) public {
        require(branchId < branchCount, "Invalid branch ID");
        currentBranch = branchId;
        emit BranchSwitched(branchId);
    }

    function getCurrentBranch() public view returns (uint256) {
        return currentBranch;
    }

    function mergeBranches(uint256 sourceBranchId, uint256 targetBranchId) public {
        require(sourceBranchId < branchCount && targetBranchId < branchCount, "Invalid branch ID");
        require(sourceBranchId != targetBranchId, "Cannot merge a branch into itself");

        bytes32[] memory sourceVersions = branches[sourceBranchId].versions;
        bytes32[] memory targetVersions = branches[targetBranchId].versions;

        for (uint i = 0; i < sourceVersions.length; i++) {
            if (!isVersionInBranch(sourceVersions[i], targetBranchId)) {
                if (hasConflict(sourceVersions[i], targetVersions[targetVersions.length - 1])) {
                    bytes32 conflictId = keccak256(abi.encodePacked(sourceVersions[i], targetVersions[targetVersions.length - 1]));
                    conflicts[conflictId] = Conflict(sourceVersions[i], targetVersions[targetVersions.length - 1], false);
                    emit ConflictDetected(conflictId, sourceVersions[i], targetVersions[targetVersions.length - 1]);
                } else {
                    branches[targetBranchId].versions.push(sourceVersions[i]);
                }
            }
        }

        emit BranchMerged(sourceBranchId, targetBranchId);
    }

    function isVersionInBranch(bytes32 versionHash, uint256 branchId) internal view returns (bool) {
        bytes32[] memory branchVersions = branches[branchId].versions;
        for (uint i = 0; i < branchVersions.length; i++) {
            if (branchVersions[i] == versionHash) {
                return true;
            }
        }
        return false;
    }

    function hasConflict(bytes32 sourceVersion, bytes32 targetVersion) internal view returns (bool) {
        return versions[sourceVersion].parent != versions[targetVersion].parent;
    }

    function resolveConflict(bytes32 conflictId, string memory resolvedCode) public {
        require(conflicts[conflictId].resolved == false, "Conflict already resolved");
        
        Conflict storage conflict = conflicts[conflictId];
        bytes32 newVersionHash = keccak256(abi.encodePacked(resolvedCode, block.timestamp, conflict.targetVersion));
        versions[newVersionHash] = Version("Conflict resolution", resolvedCode, block.timestamp, conflict.targetVersion, new string[](0), new Comment[](0));
        
        uint256 targetBranchId = getCurrentBranchForVersion(conflict.targetVersion);
        branches[targetBranchId].versions.push(newVersionHash);
        
        conflict.resolved = true;
        emit ConflictResolved(conflictId);
        emit VersionSaved(newVersionHash, targetBranchId);
    }

    function getCurrentBranchForVersion(bytes32 versionHash) internal view returns (uint256) {
        for (uint i = 0; i < branchCount; i++) {
            if (isVersionInBranch(versionHash, i)) {
                return i;
            }
        }
        revert("Version not found in any branch");
    }

    function getBranchNames() public view returns (string[] memory) {
        string[] memory names = new string[](branchCount);
        for (uint i = 0; i < branchCount; i++) {
            names[i] = branches[i].name;
        }
        return names;
    }

    function searchVersions(string memory query) public view returns (bytes32[] memory) {
        bytes32[] memory allVersions = getAllVersions();
        bytes32[] memory results = new bytes32[](allVersions.length);
        uint resultCount = 0;

        for (uint i = 0; i < allVersions.length; i++) {
            Version memory version = versions[allVersions[i]];
            if (contains(version.commitMessage, query)) {
                results[resultCount] = allVersions[i];
                resultCount++;
            }
        }

        bytes32[] memory trimmedResults = new bytes32[](resultCount);
        for (uint i = 0; i < resultCount; i++) {
            trimmedResults[i] = results[i];
        }

        return trimmedResults;
    }

    function contains(string memory source, string memory search) internal pure returns (bool) {
        bytes memory sourceBytes = bytes(source);
        bytes memory searchBytes = bytes(search);

        if (searchBytes.length > sourceBytes.length) {
            return false;
        }

        for (uint i = 0; i <= sourceBytes.length - searchBytes.length; i++) {
            bool found = true;
            for (uint j = 0; j < searchBytes.length; j++) {
                if (sourceBytes[i + j] != searchBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }

        return false;
    }

    function addTag(bytes32 versionHash, string memory tag) public {
        require(versions[versionHash].timestamp > 0, "Version does not exist");
        versions[versionHash].tags.push(tag);
        emit VersionTagged(versionHash, tag);
    }

    function getTags(bytes32 versionHash) public view returns (string[] memory) {
        return versions[versionHash].tags;
    }

    function addComment(bytes32 versionHash, string memory content) public {
        require(versions[versionHash].timestamp > 0, "Version does not exist");
        Comment memory newComment = Comment(msg.sender, content, block.timestamp);
        versions[versionHash].comments.push(newComment);
        emit CommentAdded(versionHash, msg.sender, content);
    }

    function getComments(bytes32 versionHash) public view returns (Comment[] memory) {
        return versions[versionHash].comments;
    }
}

