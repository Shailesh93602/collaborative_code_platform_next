'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, MessageSquare } from 'lucide-react';
import { VersionItemProps } from './types';

export function VersionItem({
  version,
  isSelected,
  onSelect,
  onLoad,
  onViewComments,
  onRevert,
  onReview,
  isLoading,
}: VersionItemProps) {
  return (
    <div className="flex justify-between items-center p-2 hover:bg-accent">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(version.hash)}
        className="mr-2"
      />
      <span className="text-sm truncate flex-grow">{version.message}</span>
      <div className="flex items-center space-x-2">
        {version.tags.map((tag, index) => (
          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onLoad(version.hash)} disabled={isLoading}>
          <Upload className="h-4 w-4" />
          <span className="sr-only">Load version</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewComments(version.hash)}
          disabled={isLoading}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="sr-only">View comments</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevert(version.hash)}
          disabled={isLoading}
        >
          Revert
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReview(version.hash)}
          disabled={isLoading}
        >
          Review
        </Button>
      </div>
    </div>
  );
}
