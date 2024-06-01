import { expect } from "chai";
import { ethers } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { VersionControl } from "../typechain-types";

describe("VersionControl", function () {
  let versionControl: VersionControl;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const VersionControl = await ethers.getContractFactory("VersionControl");
    versionControl = await VersionControl.deploy();
    await versionControl.deployed();
  });

  describe("Version Management", function () {
    it("should save a version", async function () {
      const commitMessage = "Initial commit";
      const code = "console.log('Hello, World!');";

      await expect(
        versionControl.saveVersion(commitMessage, ethers.utils.id(code))
      )
        .to.emit(versionControl, "VersionSaved")
        .withArgs(expect.anything(), 0); // 0 is the default branch ID (main)

      const versions = await versionControl.getAllVersions();
      expect(versions.length).to.equal(1);
    });

    it("should retrieve a saved version", async function () {
      const commitMessage = "Test commit";
      const code = "function test() { return true; }";
      const codeHash = ethers.utils.id(code);

      await versionControl.saveVersion(commitMessage, codeHash);
      const versions = await versionControl.getAllVersions();
      const [savedCommitMessage, savedCodeHash, timestamp, parent, tags] =
        await versionControl.getVersion(versions[0]);

      expect(savedCommitMessage).to.equal(commitMessage);
      expect(savedCodeHash).to.equal(codeHash);
      expect(timestamp).to.be.gt(0);
      expect(parent).to.equal(ethers.constants.HashZero);
      expect(tags.length).to.equal(0);
    });
  });

  describe("Branch Management", function () {
    it("should create a new branch", async function () {
      const branchName = "feature-branch";

      await expect(versionControl.createBranch(branchName))
        .to.emit(versionControl, "BranchCreated")
        .withArgs(1, branchName); // 1 is the new branch ID (0 is main)

      const branchNames = await versionControl.getBranchNames();
      expect(branchNames.length).to.equal(2); // main + new branch
      expect(branchNames[1]).to.equal(branchName);
    });

    it("should switch between branches", async function () {
      await versionControl.createBranch("feature-branch");
      await versionControl.switchBranch(1); // Switch to feature-branch

      expect(await versionControl.getCurrentBranch()).to.equal(1);

      await versionControl.switchBranch(0); // Switch back to main
      expect(await versionControl.getCurrentBranch()).to.equal(0);
    });

    it("should merge branches", async function () {
      await versionControl.createBranch("feature-branch");
      await versionControl.switchBranch(1);
      await versionControl.saveVersion(
        "Feature commit",
        ethers.utils.id("feature code")
      );

      await expect(versionControl.mergeBranches(1, 0))
        .to.emit(versionControl, "BranchMerged")
        .withArgs(1, 0);

      await versionControl.switchBranch(0);
      const mainVersions = await versionControl.getAllVersions();
      expect(mainVersions.length).to.equal(1);
    });
  });

  describe("Tagging and Comments", function () {
    it("should add a tag to a version", async function () {
      await versionControl.saveVersion(
        "Tagged commit",
        ethers.utils.id("tagged code")
      );
      const versions = await versionControl.getAllVersions();

      await expect(versionControl.addTag(versions[0], "v1.0.0"))
        .to.emit(versionControl, "VersionTagged")
        .withArgs(versions[0], "v1.0.0");

      const [, , , , tags] = await versionControl.getVersion(versions[0]);
      expect(tags.length).to.equal(1);
      expect(tags[0]).to.equal("v1.0.0");
    });

    it("should add a comment to a version", async function () {
      await versionControl.saveVersion(
        "Commented commit",
        ethers.utils.id("commented code")
      );
      const versions = await versionControl.getAllVersions();

      await expect(versionControl.addComment(versions[0], "Great job!"))
        .to.emit(versionControl, "CommentAdded")
        .withArgs(versions[0], owner.address, "Great job!");

      const comments = await versionControl.getComments(versions[0]);
      expect(comments.length).to.equal(1);
      expect(comments[0].content).to.equal("Great job!");
      expect(comments[0].author).to.equal(owner.address);
    });
  });
});
