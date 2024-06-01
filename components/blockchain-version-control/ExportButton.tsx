import { useWeb3 } from "@/hooks/use-web3";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { saveAs } from "file-saver";

export function ExportButton() {
  const { getAllVersions, getBranchNames, getCurrentBranch } = useWeb3();

  const handleExport = async () => {
    try {
      const versions = await getAllVersions();
      const branches = await getBranchNames();
      const currentBranch = await getCurrentBranch();

      const exportData = {
        versions,
        branches,
        currentBranch,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, "version-history-export.json");
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  return (
    <Button onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      Export History
    </Button>
  );
}
