'use client';
import React, { useState } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ExportButton({ dictionary }: { readonly dictionary: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAllVersions, getBranchNames, getCurrentBranch } = useWeb3();

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const versions = await getAllVersions(1, 1000); // Fetch up to 1000 versions
      const branches = await getBranchNames();
      const currentBranch = await getCurrentBranch();

      const exportData = {
        versions: versions.versions,
        branches,
        currentBranch,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      saveAs(blob, 'version-history-export.json');
    } catch (error) {
      console.error('Error exporting data:', error);
      setError(dictionary?.Errors?.ExportingVersionHistory);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Button onClick={handleExport} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {dictionary?.Button?.ExportHistory}
    </Button>
  );
}
