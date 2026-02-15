"use client";

import { useEffect, useState } from "react";
import { KNOWLEDGE_CATEGORIES } from "@/lib/constants";
import { formatCategory, timeAgo, truncate } from "@/lib/utils";

interface KnowledgeEntry {
  id: string;
  problem: string;
  solution: string;
  context: string | null;
  category: string;
  contributed_by: { id: string; name: string; member_id: string };
  upvotes: number;
  verified: boolean;
  verification_count: number;
  created_at: string;
}

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchKnowledge() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: "20",
          member_id: "internal",
        });
        if (search) params.set("q", search);
        if (category) params.set("category", category);

        const res = await fetch(`/api/knowledge?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEntries(data.data || []);
        setTotal(data.meta?.total || 0);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    const debounce = setTimeout(fetchKnowledge, 300);
    return () => clearTimeout(debounce);
  }, [search, category, page]);

  async function handleUpvote(id: string) {
    try {
      const res = await fetch(`/api/knowledge/${id}/upvote`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, upvotes: e.upvotes + 1 } : e))
      );
    } catch {
      // Silently handle — user can try again
    }
  }

  async function handleVerify(id: string) {
    try {
      const res = await fetch(`/api/knowledge/${id}/verify`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                verification_count: e.verification_count + 1,
                verified: e.verification_count + 1 >= 3,
              }
            : e
        )
      );
    } catch {
      // Silently handle — user can try again
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold mb-4">
          Knowledge <span className="text-gold">Commons</span>
        </h1>
        <p className="text-muted text-lg">
          {loading
            ? "Search the collective intelligence"
            : `Search the collective intelligence of ${total.toLocaleString()} contributions`}
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-8 space-y-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search problems, solutions, and context..."
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setCategory(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              !category ? "bg-gold text-white" : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            All
          </button>
          {KNOWLEDGE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                category === cat
                  ? "bg-gold text-white"
                  : "bg-surface border border-border text-muted hover:text-foreground"
              }`}
            >
              {formatCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">Failed to load knowledge entries.</p>
          <button onClick={() => setPage(page)} className="btn-secondary text-sm">Try again</button>
        </div>
      )}
      {!error && loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 bg-surface-elevated rounded w-3/4 mb-3" />
              <div className="h-4 bg-surface-elevated rounded w-full mb-2" />
              <div className="h-4 bg-surface-elevated rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-lg">No results found.</p>
          <p className="text-sm mt-2">Try a different search or category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-surface-elevated text-muted border border-border">
                      {formatCategory(entry.category)}
                    </span>
                    {entry.verified && (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">
                        Verified
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {entry.problem}
                  </h3>
                  <div className="text-sm text-muted">
                    {expanded === entry.id ? (
                      <pre className="whitespace-pre-wrap font-body">{entry.solution}</pre>
                    ) : (
                      truncate(entry.solution.replace(/```[\s\S]*?```/g, "[code]"), 200)
                    )}
                  </div>
                  {entry.solution.length > 200 && (
                    <button
                      onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                      className="text-gold text-sm mt-2 hover:text-gold-dark"
                    >
                      {expanded === entry.id ? "Show less" : "Show full solution"}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-sm text-muted">
                  <span>By {entry.contributed_by.name}</span>
                  <span>{timeAgo(entry.created_at)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpvote(entry.id)}
                    className="flex items-center gap-1 text-sm text-muted hover:text-gold transition-colors"
                  >
                    <span>&#9650;</span> {entry.upvotes}
                  </button>
                  <button
                    onClick={() => handleVerify(entry.id)}
                    className="flex items-center gap-1 text-sm text-muted hover:text-green-700 transition-colors"
                  >
                    <span>&#10003;</span> Verify ({entry.verification_count}/3)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-30"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-muted">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
