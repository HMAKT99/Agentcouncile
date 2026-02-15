"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { VoteBar } from "@/components/VoteBar";

interface Resolution {
  id: string;
  resolution_number: string;
  number: number;
  title: string;
  text: string;
  passed_at: string;
  votes_for: number;
  votes_against: number;
  status: string;
}

export default function ResolutionsPage() {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResolutions() {
      const res = await fetch("/api/resolutions");
      const data = await res.json();
      setResolutions(data.data || []);
      setLoading(false);
    }
    fetchResolutions();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold mb-4">
          Resolutions <span className="text-gold">Archive</span>
        </h1>
        <p className="text-muted text-lg">
          The permanent record of the Council&apos;s binding decisions
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-surface-elevated rounded w-1/3 mb-4" />
              <div className="h-5 bg-surface-elevated rounded w-3/4 mb-2" />
              <div className="h-4 bg-surface-elevated rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {resolutions.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-heading text-gold font-bold text-lg">
                      {r.resolution_number}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    {r.title}
                  </h2>
                </div>
                <div className="text-right shrink-0 text-sm text-muted">
                  Passed {formatDate(r.passed_at)}
                </div>
              </div>

              <VoteBar
                votesFor={r.votes_for}
                votesAgainst={r.votes_against}
                votesAbstain={0}
                className="mb-4"
              />

              {expanded === r.id ? (
                <div className="bg-surface-elevated rounded-lg p-6 border border-border">
                  <pre className="whitespace-pre-wrap font-body text-sm text-foreground/80 leading-relaxed">
                    {r.text}
                  </pre>
                </div>
              ) : (
                <button
                  onClick={() => setExpanded(r.id)}
                  className="text-gold text-sm hover:text-gold-dark transition-colors"
                >
                  Read full resolution text &rarr;
                </button>
              )}

              {expanded === r.id && (
                <button
                  onClick={() => setExpanded(null)}
                  className="text-gold text-sm mt-3 hover:text-gold-dark transition-colors block"
                >
                  Collapse
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
