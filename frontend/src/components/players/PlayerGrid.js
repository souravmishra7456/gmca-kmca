"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserCard from "@/components/shared/UserCard";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import PlayerDetailsDialog from "@/components/players/PlayerDetailsDialog";

export default function PlayerGrid({ players, loading }) {
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const filteredPlayers = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return players;

    return players.filter(
      (player) =>
        player.name?.toLowerCase().includes(query) ||
        player.memberId?.toLowerCase().includes(query) ||
        player.role?.toLowerCase().includes(query)
    );
  }, [players, search]);

  if (loading) {
    return <LoadingSpinner className="py-20" label="Loading members..." />;
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search members by name, ID, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredPlayers.length === 0 ? (
        <EmptyState
          title="No members found"
          description={
            search
              ? "Try adjusting your search terms."
              : "No members have been added yet."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPlayers.map((player) => (
            <UserCard key={player.id} {...player} onSelect={() => setSelectedPlayer(player)} />
          ))}
        </div>
      )}

      {selectedPlayer && (
        <PlayerDetailsDialog player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}
