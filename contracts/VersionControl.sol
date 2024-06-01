// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract VersionControl {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct File {
        string path;
        bytes32 contentHash;
        bool isDirectory;
    }

    struct Version {
        string commitMessage;
        bytes32 treeHash;
        uint256 timestamp;
        bytes32 parent;
        EnumerableSet.Bytes32Set tags;
    }

    struct Branch {
        string name;
        EnumerableSet.Bytes32Set versions;
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

    struct CodeReview {
        address reviewer;
        bool approved;
        uint256 timestamp;
    }

    struct ReviewComment {
        address author;
        string content;
        uint256 lineNumber;
        uint256 timestamp;
    }

    struct EncryptedVersion {
        string commitMessage;
        bytes32 encryptedContentHash;
        uint256 timestamp;
        bytes32 parent;
        EnumerableSet.Bytes32Set tags;
        bool isEncrypted;
    }

    mapping(bytes32 => Version) public versions;
    mapping(bytes32 => File[]) public trees;
    mapping(bytes32 => string) public diffs;
    mapping(uint256 => Branch) public branches;
    mapping(bytes32 => Conflict) public conflicts;
    mapping(bytes32 => Comment[]) public comments;
    mapping(bytes32 => CodeReview) public codeReviews;
    mapping(bytes32 => ReviewComment[]) public reviewComments;
    mapping(bytes32 => EncryptedVersion) public encryptedVersions;
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
    event FileCreated(string path, bool isDirectory);
    event FileDeleted(string path);
    event FileRenamed(string oldPath, string newPath);
    event FileOperation(string operation, string path);
    event VersionReviewed(bytes32 indexed versionHash, address indexed reviewer, bool approved);
    event ReviewCommentAdded(bytes32 indexed versionHash, address indexed author, uint256 lineNumber);
    event EncryptedVersionSaved(bytes32 indexed versionHash, uint256 indexed branchId);

    constructor() {
        createBranch("main");
        currentBranch = 0;
    }

    function saveVersion(string memory commitMessage, File[] memory files) public returns (bytes32) {
        require(bytes(commitMessage).length > 0, "Commit message cannot be empty");
        require(files.length > 0, "At least one file is required");
        bytes32 parentHash = branches[currentBranch].versions.length() > 0
            ? branches[currentBranch].versions.at(branches[currentBranch].versions.length() - 1)
            : bytes32(0);
        bytes32 treeHash = keccak256(abi.encode(files));
        bytes32 versionHash = keccak256(abi.encodePacked(commitMessage, treeHash, block.timestamp, parentHash));

        versions[versionHash] = Version(commitMessage, treeHash, block.timestamp, parentHash, EnumerableSet.Bytes32Set());
        trees[treeHash] = files;
        branches[currentBranch].versions.add(versionHash);

        emit VersionSaved(versionHash, currentBranch);
        return versionHash;
    }

    function getVersion(bytes32 hash) public view returns (string memory, bytes32, uint256, bytes32, string[] memory) {
        Version storage v = versions[hash];
        string[] memory tags = new string[](v.tags.length());
        for (uint i = 0; i < v.tags.length(); i++) {
            tags[i] = string(abi.encodePacked(v.tags.at(i)));
        }
        return (v.commitMessage, v.treeHash, v.timestamp, v.parent, tags);
    }

    function getTree(bytes32 treeHash) public view returns (File[] memory) {
        return trees[treeHash];
    }

    function getAllVersions() public view returns (bytes32[] memory) {
        return branches[currentBranch].versions.values();
    }

    function createBranch(string memory branchName) public returns (uint256) {
        uint256 branchId = branchCount++;
        branches[branchId].name = branchName;
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

        bytes32[] memory sourceVersions = branches[sourceBranchId].versions.values();
        bytes32[] memory targetVersions = branches[targetBranchId].versions.values();

        for (uint i = 0; i < sourceVersions.length; i++) {
            if (!branches[targetBranchId].versions.contains(sourceVersions[i])) {
                if (hasConflict(sourceVersions[i], targetVersions[targetVersions.length - 1])) {
                    bytes32 conflictId = keccak256(abi.encodePacked(sourceVersions[i], targetVersions[targetVersions.length - 1]));
                    conflicts[conflictId] = Conflict(sourceVersions[i], targetVersions[targetVersions.length - 1], false);
                    emit ConflictDetected(conflictId, sourceVersions[i], targetVersions[targetVersions.length - 1]);
                } else {
                    branches[targetBranchId].versions.add(sourceVersions[i]);
                }
            }
        }

        emit BranchMerged(sourceBranchId, targetBranchId);
    }

    function hasConflict(bytes32 sourceVersion, bytes32 targetVersion) internal view returns (bool) {
        return versions[sourceVersion].parent != versions[targetVersion].parent;
    }

    function resolveConflict(bytes32 conflictId, bytes32 resolvedCodeHash) public {
        require(!conflicts[conflictId].resolved, "Conflict already resolved");

        Conflict storage conflict = conflicts[conflictId];
        bytes32 newVersionHash = keccak256(abi.encodePacked(resolvedCodeHash, block.timestamp, conflict.targetVersion));
        versions[newVersionHash] = Version("Conflict resolution", resolvedCodeHash, block.timestamp, conflict.targetVersion, EnumerableSet.Bytes32Set());

        uint256 targetBranchId = getCurrentBranchForVersion(conflict.targetVersion);
        branches[targetBranchId].versions.add(newVersionHash);

        conflict.resolved = true;
        emit ConflictResolved(conflictId);
        emit VersionSaved(newVersionHash, targetBranchId);
    }

    function getCurrentBranchForVersion(bytes32 versionHash) internal view returns (uint256) {
        for (uint i = 0; i < branchCount; i++) {
            if (branches[i].versions.contains(versionHash)) {
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

    function addTag(bytes32 versionHash, string memory tag) public {
        require(versions[versionHash].timestamp > 0, "Version does not exist");
        versions[versionHash].tags.add(keccak256(abi.encodePacked(tag)));
        emit VersionTagged(versionHash, tag);
    }

    function getTags(bytes32 versionHash) public view returns (string[] memory) {
        string[] memory tags = new string[](versions[versionHash].tags.length());
        for (uint i = 0; i < versions[versionHash].tags.length(); i++) {
            tags[i] = string(abi.encodePacked(versions[versionHash].tags.at(i)));
        }
        return tags;
    }

    function addComment(bytes32 versionHash, string memory content) public {
        require(versions[versionHash].timestamp > 0, "Version does not exist");
        comments[versionHash].push(Comment(msg.sender, content, block.timestamp));
        emit CommentAdded(versionHash, msg.sender, content);
    }

    function getComments(bytes32 versionHash) public view returns (Comment[] memory) {
        return comments[versionHash];
    }

    function batchSaveVersions(string[] memory commitMessages, bytes32[] memory codeHashes) public returns (bytes32[] memory) {
        require(commitMessages.length == codeHashes.length, "Input arrays must have the same length");
        bytes32[] memory versionHashes = new bytes32[](commitMessages.length);
        for (uint i = 0; i < commitMessages.length; i++) {
            versionHashes[i] = saveVersion(commitMessages[i], codeHashes[i]);
        }
        return versionHashes;
    }

    function createFile(string memory path, bytes32 contentHash, bool isDirectory) public {
        bytes32 latestVersionHash = branches[currentBranch].versions.at(branches[currentBranch].versions.length() - 1);
        Version storage latestVersion = versions[latestVersionHash];
        File[] storage files = trees[latestVersion.treeHash];

        for (uint i = 0; i < files.length; i++) {
            require(keccak256(abi.encodePacked(files[i].path)) != keccak256(abi.encodePacked(path)), "File or directory already exists");
        }

        files.push(File(path, contentHash, isDirectory));
        emit FileCreated(path, isDirectory);
        emit FileOperation("create", path);
    }

    function deleteFile(string memory path) public {
        bytes32 latestVersionHash = branches[currentBranch].versions.at(branches[currentBranch].versions.length() - 1);
        Version storage latestVersion = versions[latestVersionHash];
        File[] storage files = trees[latestVersion.treeHash];

        for (uint i = 0; i < files.length; i++) {
            if (keccak256(abi.encodePacked(files[i].path)) == keccak256(abi.encodePacked(path))) {
                files[i] = files[files.length - 1];
                files.pop();
                emit FileDeleted(path);
                emit FileOperation("delete", path);
                return;
            }
        }

        revert("File or directory not found");
    }

    function renameFile(string memory oldPath, string memory newPath) public {
        bytes32 latestVersionHash = branches[currentBranch].versions.at(branches[currentBranch].versions.length() - 1);
        Version storage latestVersion = versions[latestVersionHash];
        File[] storage files = trees[latestVersion.treeHash];

        for (uint i = 0; i < files.length; i++) {
            if (keccak256(abi.encodePacked(files[i].path)) == keccak256(abi.encodePacked(oldPath))) {
                files[i].path = newPath;
                emit FileRenamed(oldPath, newPath);
                emit FileOperation("rename", string(abi.encodePacked(oldPath, " to ", newPath)));
                return;
            }
        }

        revert("File or directory not found");
    }

    function revertToVersion(bytes32 versionHash) public {
        require(versions[versionHash].timestamp > 0, "Version does not exist");
        require(branches[currentBranch].versions.contains(versionHash), "Version not in current branch");

        bytes32 currentVersionHash = branches[currentBranch].versions.at(branches[currentBranch].versions.length() - 1);
        if (currentVersionHash == versionHash) {
            return; // Already at the desired version
        }

        // Create a new version that reverts to the specified version
        string memory commitMessage = string(abi.encodePacked("Revert to version ", toHexString(versionHash)));
        bytes32 newVersionHash = keccak256(abi.encodePacked(commitMessage, versions[versionHash].treeHash, block.timestamp, currentVersionHash));

        versions[newVersionHash] = Version(commitMessage, versions[versionHash].treeHash, block.timestamp, currentVersionHash, EnumerableSet.Bytes32Set());
        branches[currentBranch].versions.add(newVersionHash);

        emit VersionSaved(newVersionHash, currentBranch);
    }

    // Helper function to convert bytes32 to hex string
    function toHexString(bytes32 value) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i*2] = alphabet[uint8(value[i] >> 4)];
            str[1+i*2] = alphabet[uint8(value[i] & 0x0f)];
        }
        return string(str);
    }

    function searchVersions(string memory query) public view returns (bytes32[] memory) {
        bytes32[] memory allVersions = getAllVersions();
        bytes32[] memory matchingVersions = new bytes32[](allVersions.length);
        uint256 matchCount = 0;

        for (uint256 i = 0; i < allVersions.length; i++) {
            Version storage version = versions[allVersions[i]];
            if (contains(version.commitMessage, query)) {
                matchingVersions[matchCount] = allVersions[i];
                matchCount++;
            }
        }

        bytes32[] memory result = new bytes32[](matchCount);
        for (uint256 i = 0; i < matchCount; i++) {
            result[i] = matchingVersions[i];
        }

        return result;
    }

    function contains(string memory source, string memory search) private pure returns (bool) {
        bytes memory sourceBytes = bytes(source);
        bytes memory searchBytes = bytes(search);

        if (searchBytes.length > sourceBytes.length) {
            return false;
        }

        for (uint256 i = 0; i <= sourceBytes.length - searchBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < searchBytes.length; j++) {
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

    function getVersionCount() public view returns (uint256) {
        return branches[currentBranch].versions.length();
    }

    function getVersionRange(uint256 start, uint256 end) public view returns (bytes32[] memory) {
        require(start < end, "Invalid range");
        require(end <= branches[currentBranch].versions.length(), "End out of range");

        bytes32[] memory rangeVersions = new bytes32[](end - start);
        for (uint256 i = start; i < end; i++) {
            rangeVersions[i - start] = branches[currentBranch].versions.at(i);
        }
        return rangeVersions;
    }

    function approveVersion(bytes32 versionHash) public {
        require(versions[versionHash].timestamp > 0, "Version does not exist");
        codeReviews[versionHash] = CodeReview(msg.sender, true, block.timestamp);
        emit VersionReviewed(versionHash, msg.sender, true);
    }

    function rejectVersion(bytes32 versionHash) public {
        require(versions[versionHash].timestamp > 0, "Version does not exist");
        codeReviews[versionHash] = CodeReview(msg.sender, false, block.timestamp);
        emit VersionReviewed(versionHash, msg.sender, false);
    }

    function getApprovalStatus(bytes32 versionHash) public view returns (bool approved, address reviewer, uint256 timestamp) {
        CodeReview storage review = codeReviews[versionHash];
        return (review.approved, review.reviewer, review.timestamp);
    }

    function addReviewComment(bytes32 versionHash, string memory content, uint256 lineNumber) public {
        require(versions[versionHash].timestamp > 0, "Version does not exist");
        reviewComments[versionHash].push(ReviewComment(msg.sender, content, lineNumber, block.timestamp));
        emit ReviewCommentAdded(versionHash, msg.sender, lineNumber);
    }

    function getReviewComments(bytes32 versionHash) public view returns (ReviewComment[] memory) {
        return reviewComments[versionHash];
    }

    function saveEncryptedVersion(string memory commitMessage, bytes32 encryptedContentHash) public returns (bytes32) {
        require(bytes(commitMessage).length > 0, "Commit message cannot be empty");
        
        bytes32 parentHash = branches[currentBranch].versions.length() > 0
            ? branches[currentBranch].versions.at(branches[currentBranch].versions.length() - 1)
            : bytes32(0);
        
        bytes32 versionHash = keccak256(abi.encodePacked(commitMessage, encryptedContentHash, block.timestamp, parentHash));

        encryptedVersions[versionHash] = EncryptedVersion(commitMessage, encryptedContentHash, block.timestamp, parentHash, EnumerableSet.Bytes32Set(), true);
        branches[currentBranch].versions.add(versionHash);

        emit EncryptedVersionSaved(versionHash, currentBranch);
        return versionHash;
    }

    function getEncryptedVersion(bytes32 hash) public view returns (string memory, bytes32, uint256, bytes32, string[] memory, bool) {
        EncryptedVersion storage v = encryptedVersions[hash];
        string[] memory tags = new string[](v.tags.length());
        for (uint i = 0; i < v.tags.length(); i++) {
            tags[i] = string(abi.encodePacked(v.tags.at(i)));
        }
        return (v.commitMessage, v.encryptedContentHash, v.timestamp, v.parent, tags, v.isEncrypted);
    }
}

