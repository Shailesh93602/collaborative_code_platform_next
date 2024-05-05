// components/blockchain-version-control.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWeb3 } from "@/hooks/use-web3";
import { CodeVersion } from "@/types/global";
import { useToast } from "@/hooks/use-toast";

export function BlockchainVersionControl({
  code,
  onCodeUpdate,
}: {
  readonly code: string;
  readonly onCodeUpdate: (code: string) => void;
}) {
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [commitMessage, setCommitMessage] = useState("");
  const { saveVersion, loadVersion } = useWeb3();
  const { toast } = useToast();

  const handleSaveVersion = async () => {
    if (!commitMessage.trim()) return;
    try {
      const newVersion = await saveVersion(commitMessage, code);
      setVersions([...versions, newVersion]);
      setCommitMessage("");
      toast({
        title: "Version saved",
        description: `Your code has been saved to the blockchain with commit message: ${commitMessage}`,
      });
    } catch (error) {
      console.error("Failed to save version:", error);
      toast({
        title: "Error saving version",
        description:
          "There was an error saving your code to the blockchain. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLoadVersion = async (version: CodeVersion) => {
    try {
      const loadedCode = await loadVersion(version.hash);
      onCodeUpdate(loadedCode as any);
      toast({
        title: "Version loaded",
        description: `Code version from ${new Date(
          version.timestamp
        ).toLocaleString()} has been loaded.`,
      });
    } catch (error) {
      console.error("Failed to load version:", error);
      toast({
        title: "Error loading version",
        description:
          "There was an error loading the code version from the blockchain. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Version Control</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Blockchain Version Control</DialogTitle>
          <DialogDescription>
            Save and load versions of your code securely on the blockchain.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit message"
            />
            <Button onClick={handleSaveVersion}>Save</Button>
          </div>
          <ScrollArea className="h-[200px]">
            {versions.map((version, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 hover:bg-gray-100"
              >
                <span>{version.message}</span>
                <Button
                  variant="ghost"
                  onClick={() => handleLoadVersion(version)}
                >
                  Load
                </Button>
              </div>
            ))}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
