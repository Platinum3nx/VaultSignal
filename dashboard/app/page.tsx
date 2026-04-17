"use client";

import { useEffect, useState } from "react";
import DigestHeader from "./components/DigestHeader";
import ObservationCard from "./components/ObservationCard";
import HistoryList from "./components/HistoryList";

interface TodayData {
  run_id: string;
  created_at: string;
  observations: string[];
  vault_page_count: number;
}

interface HistoryRun {
  run_id: string;
  created_at: string;
  observation_count: number;
}

interface ApiResponse {
  today: TodayData | null;
  history: HistoryRun[];
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/observations")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData({ today: null, history: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500 text-sm font-mono">loading...</p>
      </main>
    );
  }

  if (!data?.today) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500 text-sm font-mono">
          No observations yet. Run the agent first.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <DigestHeader
          date={data.today.created_at}
          observationCount={data.today.observations.length}
          vaultPageCount={data.today.vault_page_count}
        />
        <div className="space-y-4">
          {data.today.observations.map((obs, i) => (
            <ObservationCard key={i} observation={obs} index={i} />
          ))}
        </div>
        <HistoryList history={data.history} />
      </div>
    </main>
  );
}
