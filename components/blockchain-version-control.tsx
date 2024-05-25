"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/use-web3";

interface BlockchainVersionControlProps {
  readonly code: string;
  readonly onCodeUpdate: (code: string) => void;
}

export function BlockchainVersionControl({
  code,
  onCodeUpdate,
}: BlockchainVersionControlProps) {
  const [commitMessage, setCommitMessage] = useState("");
  const [versionHash, setVersionHash] = useState("");
  const { toast } = useToast();
  const { saveVersion, loadVersion } = useWeb3();

  const handleSave = async () => {
    if (!commitMessage) {
      toast({
        title: "Error",
        description: "Please enter a commit message.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await saveVersion(commitMessage, code);
      setVersionHash(result.hash);
      toast({
        title: "Success",
        description: `Version saved with hash: ${result.hash}`,
      });
    } catch (error) {
      console.error("Error saving version:", error);
      toast({
        title: "Error",
        description: "Failed to save version to blockchain.",
        variant: "destructive",
      });
    }
  };

  const handleLoad = async () => {
    if (!versionHash) {
      toast({
        title: "Error",
        description: "Please enter a version hash.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await loadVersion(versionHash);
      onCodeUpdate(result.code);
      toast({
        title: "Success",
        description: `Version loaded: ${result.commitMessage}`,
      });
    } catch (error) {
      console.error("Error loading version:", error);
      toast({
        title: "Error",
        description: "Failed to load version from blockchain.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Blockchain Version Control</h2>
      <div className="space-y-2">
        <Input
          placeholder="Commit message"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
        />
        <Button onClick={handleSave}>Save Version</Button>
      </div>
      <div className="space-y-2">
        <Input
          placeholder="Version hash"
          value={versionHash}
          onChange={(e) => setVersionHash(e.target.value)}
        />
        <Button onClick={handleLoad}>Load Version</Button>
      </div>
    </div>
  );
}
