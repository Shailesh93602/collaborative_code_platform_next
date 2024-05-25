import React, { useState, useEffect } from "react";
import { useWeb3 } from "@/hooks/use-web3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function BranchManager() {
  const [branches, setBranches] = useState<string[]>([]);
  const [newBranchName, setNewBranchName] = useState("");
  const [sourceBranch, setSourceBranch] = useState("");
  const [targetBranch, setTargetBranch] = useState("");
  const {
    createBranch,
    switchBranch,
    mergeBranches,
    getBranchNames,
    currentBranch,
  } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const branchNames = await getBranchNames();
      setBranches(branchNames);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch branches",
        variant: "destructive",
      });
    }
  };

  const handleCreateBranch = async () => {
    try {
      await createBranch(newBranchName);
      setNewBranchName("");
      fetchBranches();
      toast({
        title: "Success",
        description: `Branch "${newBranchName}" created`,
      });
    } catch (error) {
      console.error("Error creating branch:", error);
      toast({
        title: "Error",
        description: "Failed to create branch",
        variant: "destructive",
      });
    }
  };

  const handleSwitchBranch = async (branchId: string) => {
    try {
      await switchBranch(parseInt(branchId));
      toast({
        title: "Success",
        description: `Switched to branch "${branches[parseInt(branchId)]}"`,
      });
    } catch (error) {
      console.error("Error switching branch:", error);
      toast({
        title: "Error",
        description: "Failed to switch branch",
        variant: "destructive",
      });
    }
  };

  const handleMergeBranches = async () => {
    try {
      await mergeBranches(parseInt(sourceBranch), parseInt(targetBranch));
      toast({
        title: "Success",
        description: `Merged branch "${
          branches[parseInt(sourceBranch)]
        }" into "${branches[parseInt(targetBranch)]}"`,
      });
    } catch (error) {
      console.error("Error merging branches:", error);
      toast({
        title: "Error",
        description: "Failed to merge branches",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Branch Manager</h2>
      <div className="flex space-x-2">
        <Input
          placeholder="New branch name"
          value={newBranchName}
          onChange={(e) => setNewBranchName(e.target.value)}
        />
        <Button onClick={handleCreateBranch}>Create Branch</Button>
      </div>
      <div>
        <h3 className="text-md font-semibold">
          Current Branch: {branches[currentBranch]}
        </h3>
        <Select onValueChange={handleSwitchBranch}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Switch branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch, index) => (
              <SelectItem key={index} value={index.toString()}>
                {branch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className="text-md font-semibold">Merge Branches</h3>
        <div className="flex space-x-2">
          <Select onValueChange={setSourceBranch}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Source branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setTargetBranch}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Target branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleMergeBranches}>Merge</Button>
        </div>
      </div>
    </div>
  );
}
