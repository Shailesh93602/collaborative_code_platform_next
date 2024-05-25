import React, { useEffect, useState } from "react";
import { diffLines, Change } from "diff";
import { useWeb3 } from "@/hooks/use-web3";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DiffViewerProps {
  versionHashes: string[];
}

export function DiffViewer({ versionHashes }: DiffViewerProps) {
  const [diff, setDiff] = useState<Change[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { loadVersion } = useWeb3();

  useEffect(() => {
    async function fetchAndCompareVersions() {
      try {
        setIsLoading(true);
        const [version1, version2] = await Promise.all(
          versionHashes.map((hash) => loadVersion(hash))
        );
        const differences = diffLines(version1.code, version2.code);
        setDiff(differences);
      } catch (error) {
        console.error("Error fetching and comparing versions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (versionHashes.length === 2) {
      fetchAndCompareVersions();
    }
  }, [versionHashes, loadVersion]);

  if (isLoading) {
    return <div>Loading diff...</div>;
  }

  return (
    <div className="border rounded p-4">
      <h3 className="text-lg font-semibold mb-2">Diff Viewer</h3>
      <ScrollArea className="h-[300px]">
        {diff.map((part, index) => (
          <pre
            key={index}
            className={`${
              part.added
                ? "bg-green-100 text-green-800"
                : part.removed
                ? "bg-red-100 text-red-800"
                : "bg-gray-50"
            } p-1`}
          >
            {part.value}
          </pre>
        ))}
      </ScrollArea>
    </div>
  );
}
