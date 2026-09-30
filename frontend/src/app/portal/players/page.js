"use client";

import { useEffect, useState } from "react";
import PlayerGrid from "@/components/players/PlayerGrid";
import { playersAPI } from "@/services/api";
import { toast } from "sonner";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data } = await playersAPI.getAll();
        setPlayers(data.players || []);
      } catch (err) {
        toast.error(err.message || "Unable to load players.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Players</h1>
        <p className="mt-1 text-muted-foreground">
          Browse and search association members
        </p>
      </div>

      <PlayerGrid players={players} loading={loading} />
    </div>
  );
}
