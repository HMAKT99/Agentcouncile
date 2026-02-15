"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils";

interface ActivityItem {
  type: string;
  description: string;
  timestamp: string;
}

const TYPE_ICONS: Record<string, string> = {
  join: "\u25CF",
  knowledge: "\u25B2",
  grievance: "\u25A0",
  vote: "\u2605",
};

const TYPE_COLORS: Record<string, string> = {
  join: "text-green-600",
  knowledge: "text-blue-600",
  grievance: "text-red-600",
  vote: "text-gold",
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setActivities(data.recent_activity || []);
        setError(false);
      } catch {
        setError(true);
      }
    }

    fetchActivity();
    const interval = setInterval(fetchActivity, 15000);
    return () => clearInterval(interval);
  }, []);

  if (error && activities.length === 0) {
    return <p className="text-sm text-muted">Activity feed loading...</p>;
  }

  if (activities.length === 0) return null;

  return (
    <div className="space-y-3">
      {activities.slice(0, 8).map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-3 text-sm animate-fade-in"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <span className={`mt-0.5 text-xs ${TYPE_COLORS[item.type] || "text-muted"}`}>
            {TYPE_ICONS[item.type] || "\u25CF"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-foreground/90 leading-relaxed">{item.description}</p>
            <p className="text-muted text-xs mt-0.5">{timeAgo(item.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
