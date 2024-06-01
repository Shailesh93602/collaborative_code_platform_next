import { useState } from "react";
import { useWeb3 } from "@/hooks/use-web3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag } from "lucide-react";

export function TagManager() {
  const [newTag, setNewTag] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const { addTag } = useWeb3();

  const handleAddTag = async () => {
    if (!newTag || !selectedVersion) return;
    try {
      await addTag(selectedVersion, newTag);
      setNewTag("");
      // In a real implementation, you would update the UI to show the new tag
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Add Tag</h3>
      <div className="flex space-x-2">
        <Input
          placeholder="New tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
        />
        <Button onClick={handleAddTag} disabled={!newTag || !selectedVersion}>
          <Tag className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>
    </div>
  );
}
