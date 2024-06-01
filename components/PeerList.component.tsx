"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollaboration } from "@/hooks/useCollaboration.hook";
import { User } from "@/types/global";
import { Users } from "lucide-react";

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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Users className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h2 className="text-lg font-semibold mb-2">Connected Peers</h2>
        <ScrollArea className="h-[300px]">
          {peers.map((peer) => (
            <div key={peer.id} className="flex items-center space-x-4 mb-2">
              <Avatar>
                <AvatarImage src={peer.avatar} alt={peer.name} />
                <AvatarFallback>{peer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{peer.name}</p>
                <p className="text-sm text-muted-foreground">{peer.status}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
