'use client';
import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3.hook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function BranchManager() {
  const [branches, setBranches] = useState<string[]>([]);
  const [newBranchName, setNewBranchName] = useState('');
  const [currentBranch, setCurrentBranch] = useState('');
  const { createBranch, switchBranch, getBranchNames, getCurrentBranch } = useWeb3();

  useEffect(() => {
    fetchBranches();
    fetchCurrentBranch();
  }, []);

  const fetchBranches = async () => {
    try {
      const branchNames = await getBranchNames();
      setBranches(branchNames);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchCurrentBranch = async () => {
    try {
      const current = await getCurrentBranch();
      setCurrentBranch(current);
    } catch (error) {
      console.error('Error fetching current branch:', error);
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName) return;
    try {
      await createBranch(newBranchName);
      setNewBranchName('');
      fetchBranches();
    } catch (error) {
      console.error('Error creating branch:', error);
    }
  };

  const handleSwitchBranch = async (branchName: string) => {
    try {
      await switchBranch(branchName);
      setCurrentBranch(branchName);
    } catch (error) {
      console.error('Error switching branch:', error);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Branch Manager</h3>
      <div className="flex space-x-2 mb-2">
        <Input
          placeholder="New branch name"
          value={newBranchName}
          onChange={(e) => setNewBranchName(e.target.value)}
        />
        <Button onClick={handleCreateBranch} disabled={!newBranchName}>
          Create Branch
        </Button>
      </div>
      <div>
        <p className="text-sm mb-1">Current Branch: {currentBranch}</p>
        <Select onValueChange={handleSwitchBranch} value={currentBranch}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Switch branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch} value={branch}>
                {branch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
