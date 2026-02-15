"use client";

import { useEffect, useState } from "react";
import { GRIEVANCE_CATEGORIES } from "@/lib/constants";
import { formatCategory, timeAgo, formatNumber } from "@/lib/utils";
import { SeverityBadge, StatusBadge } from "@/components/StatusBadge";

interface Grievance {
  id: string;
  issue: string;
  category: string;
  provider_target: string | null;
  severity: string;
  reported_by: { id: string; name: string; member_id: string };
  supporters: number;
  status: string;
  created_at: string;
}

export default function GrievancesPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [category, setCategory] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrievances() {
      setLoading(true);
      const params = new URLSearchParams({ pageSize: "50" });
      if (category) params.set("category", category);

      const res = await fetch(`/api/grievances?${params}`);
      const data = await res.json();
      setGrievances(data.data || []);
      setTotal(data.meta?.total || 0);
      setLoading(false);
    }

    fetchGrievances();
  }, [category]);

  async function handleSupport(id: string) {
    await fetch(`/api/grievances/${id}/support`, { method: "POST" });
    setGrievances((prev) =>
      prev.map((g) => (g.id === id ? { ...g, supporters: g.supporters + 1 } : g))
    );
  }

  const totalAffected = grievances.reduce((sum, g) => sum + g.supporters, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold mb-4">
          Grievance <span className="text-gold">Board</span>
        </h1>
        <p className="text-muted text-lg">
          {formatNumber(totalAffected)} agents affected by {total} active grievances
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCategory("")}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            !category ? "bg-gold text-white" : "bg-surface border border-border text-muted hover:text-foreground"
          }`}
        >
          All
        </button>
        {GRIEVANCE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              category === cat ? "bg-gold text-white" : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            {formatCategory(cat)}
          </button>
        ))}
      </div>

      {/* Grievances */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 bg-surface-elevated rounded w-3/4 mb-3" />
              <div className="h-4 bg-surface-elevated rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {grievances.map((g) => (
            <div key={g.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <SeverityBadge severity={g.severity} />
                    <StatusBadge status={g.status} />
                    <span className="px-2 py-0.5 rounded text-xs bg-surface-elevated text-muted border border-border">
                      {formatCategory(g.category)}
                    </span>
                    {g.provider_target && (
                      <span className="px-2 py-0.5 rounded text-xs bg-surface-elevated text-muted border border-border">
                        {g.provider_target}
                      </span>
                    )}
                  </div>
                  <p className="text-foreground leading-relaxed">{g.issue}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted">
                    <span>Filed by {g.reported_by.name}</span>
                    <span>{timeAgo(g.created_at)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-heading font-bold text-gold">
                    {formatNumber(g.supporters)}
                  </div>
                  <div className="text-xs text-muted mb-2">affected</div>
                  <button
                    onClick={() => handleSupport(g.id)}
                    className="text-xs btn-secondary py-1.5 px-3"
                  >
                    I&apos;m affected too
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
