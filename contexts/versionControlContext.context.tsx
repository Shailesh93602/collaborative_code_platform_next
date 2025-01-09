import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';

interface Version {
  hash: string;
  message: string;
  timestamp: number;
}

interface VersionControlContextType {
  versions: Version[];
  currentPage: number;
  totalPages: number;
  selectedVersion: string | null;
  isLoading: boolean;
  error: string | null;
  setCurrentPage: (page: number) => void;
  setSelectedVersion: (hash: string | null) => void;
  refreshVersions: () => Promise<void>;
}

const VersionControlContext = createContext<VersionControlContextType | undefined>(undefined);

export const useVersionControl = () => {
  const context = useContext(VersionControlContext);
  if (context === undefined) {
    throw new Error('useVersionControl must be used within a VersionControlProvider');
  }
  return context;
};

export const VersionControlProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAllVersions } = useWeb3();

  const VERSIONS_PER_PAGE = 10;

  const refreshVersions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllVersions(currentPage, VERSIONS_PER_PAGE);
      setVersions(result.versions);
      setTotalPages(Math.ceil(result.total / VERSIONS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching versions:', error);
      setError('Failed to fetch version history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshVersions();
  }, [currentPage]);

  return (
    <VersionControlContext.Provider
      value={{
        versions,
        currentPage,
        totalPages,
        selectedVersion,
        isLoading,
        error,
        setCurrentPage,
        setSelectedVersion,
        refreshVersions,
      }}
    >
      {children}
    </VersionControlContext.Provider>
  );
};
