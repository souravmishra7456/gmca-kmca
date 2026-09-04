"use client";

import { useEffect, useState } from "react";
import PlayerGrid from "@/components/players/PlayerGrid";
import { playersAPI } from "@/services/api";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data } = await playersAPI.getAll();
        setPlayers(data.players || []);
      } catch (err) {
        setError(err.message);
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

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <PlayerGrid players={players} loading={loading} />
    </div>
  );
}
