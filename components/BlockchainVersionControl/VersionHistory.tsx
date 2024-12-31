import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VersionItem } from './VersionItem';
import { useVirtualizer } from '@tanstack/react-virtual';
import { VersionHistoryProps } from './types';

export default function VersionHistory({
  versions = [],
  selectedVersions,
  selectedFile,
  onSelect = () => {},
  onLoad,
  onViewComments = () => {},
  onRevert = () => {},
  onReview = () => {},
  isLoading = false,
  dictionary,
  lang,
}: VersionHistoryProps) {
  const scrollRef = React.useRef(null);

  const virtualizer = useVirtualizer({
    count: versions?.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  return (
    <ScrollArea className="h-[200px] border rounded" ref={scrollRef}>
      {versions.length === 0 ? (
        <div className="flex items-center justify-center h-full">No versions available</div>
      ) : (
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <VersionItem
                version={versions[virtualItem.index]}
                isSelected={Boolean(selectedVersions?.includes(versions[virtualItem?.index]?.hash))}
                onSelect={onSelect}
                onLoad={onLoad}
                onViewComments={onViewComments}
                onRevert={onRevert}
                onReview={onReview}
                isLoading={isLoading}
                dictionary={dictionary}
                lang={lang}
              />
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
