import { useState, useEffect } from "react";
import { useWeb3 } from "@/hooks/userWeb3.hook";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, MessageSquare } from "lucide-react";

interface Version {
  hash: string;
  message: string;
  timestamp: number;
}

interface VersionHistoryProps {
  onLoad: (hash: string) => void;
  selectedFile: string | null;
}

export function VersionHistory({ onLoad, selectedFile }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getAllVersions } = useWeb3();

  useEffect(() => {
    fetchVersions();
  }, [selectedFile]);

  const fetchVersions = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const fetchedVersions = await getAllVersions();
      setVersions(fetchedVersions);
    } catch (error) {
      console.error("Error fetching versions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-1/2">
      <h3 className="text-sm font-medium mb-2">Version History</h3>
      <ScrollArea className="h-[200px] border rounded">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            Loading versions...
          </div>
        ) : (
          versions.map((version) => (
            <div
              key={version.hash}
              className="flex justify-between items-center p-2 hover:bg-accent"
            >
              <span className="text-sm truncate flex-grow">
                {version.message}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLoad(version.hash)}
                >
                  <Upload className="h-4 w-4" />
                  <span className="sr-only">Load version</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4" />
                  <span className="sr-only">View comments</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
