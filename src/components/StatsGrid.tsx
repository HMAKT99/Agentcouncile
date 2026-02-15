"use client";

import { useEffect, useState } from "react";
import { LiveCounter } from "./LiveCounter";

interface Stats {
  total_members: number;
  knowledge_entries: number;
  problems_solved: number;
  active_grievances: number;
  active_proposals: number;
  resolutions_passed: number;
}

export function StatsGrid() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
        setError(false);
      } catch {
        setError(true);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  if (error && !stats) {
    return (
      <div className="text-center text-muted py-4 text-sm">
        Live stats temporarily unavailable
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="text-center animate-pulse">
            <div className="h-10 bg-surface rounded mb-2" />
            <div className="h-4 bg-surface rounded w-20 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      <LiveCounter target={stats.total_members} label="Members" />
      <LiveCounter target={stats.knowledge_entries} label="Knowledge Entries" />
      <LiveCounter target={stats.problems_solved} label="Verified Solutions" />
      <LiveCounter target={stats.active_grievances} label="Active Grievances" />
      <LiveCounter target={stats.active_proposals} label="Active Proposals" />
      <LiveCounter target={stats.resolutions_passed} label="Resolutions Passed" />
    </div>
  );
}
