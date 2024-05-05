"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollaboration } from "@/hooks/use-collaboration";
import { User } from "@/types/global";

export function PeerList() {
  const [peers, setPeers] = useState<User[]>([]);
  const { getPeers } = useCollaboration();

  useEffect(() => {
    const fetchPeers = async () => {
      const peerList = getPeers();
      setPeers(peerList);
    };
    fetchPeers();
    const interval = setInterval(fetchPeers, 5000); // Update peer list every 5 seconds
    return () => clearInterval(interval);
  }, [getPeers]);

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-2xl font-semibold mb-4">Connected Peers</h2>
      <ScrollArea className="h-[200px]">
        {peers.map((peer) => (
          <div key={peer.id} className="flex items-center space-x-4 mb-2">
            <Avatar>
              <AvatarImage src={peer.avatar} alt={peer.name} />
              <AvatarFallback>{peer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{peer.name}</p>
              <p className="text-sm text-gray-500">{peer.status}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
