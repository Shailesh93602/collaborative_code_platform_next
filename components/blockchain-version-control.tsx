"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWeb3 } from "@/hooks/use-web3";
import { GitBranch } from "lucide-react";

interface BlockchainVersionControlProps {
  code: string;
  onCodeUpdate: (code: string) => void;
}

export function BlockchainVersionControl({
  code,
  onCodeUpdate,
}: BlockchainVersionControlProps) {
  const [commitMessage, setCommitMessage] = useState("");
  const [versionHash, setVersionHash] = useState("");
  const { saveVersion, loadVersion } = useWeb3();

  const handleSave = async () => {
    try {
      const result = await saveVersion(commitMessage, code);
      setVersionHash(result.hash);
    } catch (error) {
      console.error("Error saving version:", error);
    }
  };

  const handleLoad = async () => {
    try {
      const result = await loadVersion(versionHash);
      onCodeUpdate(result.code);
    } catch (error) {
      console.error("Error loading version:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <GitBranch className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Blockchain Version Control</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Commit message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
            />
          </div>
          <Button onClick={handleSave}>Save Version</Button>
          <div>
            <Input
              placeholder="Version hash"
              value={versionHash}
              onChange={(e) => setVersionHash(e.target.value)}
            />
          </div>
          <Button onClick={handleLoad}>Load Version</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
