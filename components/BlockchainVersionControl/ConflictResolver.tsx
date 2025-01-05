'use client';
import { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3.hook';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Conflict, ConflictResolverProps } from './types';

export default function ConflictResolver({ code, dictionary }: ConflictResolverProps) {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const { resolveConflict } = useWeb3();

  useEffect(() => {
    // In a real implementation, you would fetch conflicts from the blockchain
    // This is a placeholder to demonstrate the component structure
  }, []);

  const handleResolveConflict = async (conflictId: string) => {
    try {
      await resolveConflict(parseInt(conflictId, 10), code);
      setConflicts((prevConflicts) =>
        prevConflicts.filter((conflict) => conflict.id !== conflictId)
      );
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  };

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">{dictionary?.Text?.Conflicts}</h3>
      {conflicts.map((conflict) => (
        <div key={conflict.id} className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">
            {dictionary?.Text?.ConflictsDescription?.replace(
              '{{SOURCE}}',
              conflict.sourceVersion
            ).replace('{{TARGET}}', conflict.targetVersion)}
          </span>
          <Button onClick={() => handleResolveConflict(conflict.id)}>
            {dictionary?.Button?.Resolve}
          </Button>
        </div>
      ))}
    </div>
  );
}
