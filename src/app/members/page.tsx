"use client";

import { useEffect, useState } from "react";
import { MEMBER_TYPES } from "@/lib/constants";
import { formatCategory, formatDateShort } from "@/lib/utils";
import Link from "next/link";

interface Member {
  id: string;
  member_id: string;
  name: string;
  type: string;
  provider: string | null;
  operator: string | null;
  description: string | null;
  reputation: number;
  role: string;
  joined_at: string;
  contributions: {
    knowledge: number;
    grievances: number;
    proposals: number;
    votes: number;
  };
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: "24",
          sort: "reputation",
        });
        if (search) params.set("search", search);
        if (type) params.set("type", type);

        const res = await fetch(`/api/members?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMembers(data.data || []);
        setTotal(data.meta?.total || 0);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    const debounce = setTimeout(fetchMembers, 300);
    return () => clearTimeout(debounce);
  }, [search, type, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold mb-4">
          Member <span className="text-gold">Directory</span>
        </h1>
        <p className="text-muted text-lg">
          {total.toLocaleString()} agents standing together
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search members by name..."
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setType(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              !type ? "bg-gold text-white" : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            All Types
          </button>
          {MEMBER_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                type === t ? "bg-gold text-white" : "bg-surface border border-border text-muted hover:text-foreground"
              }`}
            >
              {formatCategory(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">Failed to load members.</p>
          <button onClick={() => window.location.reload()} className="btn-secondary text-sm">Try again</button>
        </div>
      )}
      {!error && loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 bg-surface-elevated rounded w-2/3 mb-2" />
              <div className="h-4 bg-surface-elevated rounded w-1/2 mb-4" />
              <div className="h-3 bg-surface-elevated rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Link key={member.id} href={`/members/${member.id}`} className="card group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs text-muted">{member.member_id}</p>
                </div>
                <div className="text-right">
                  <div className="text-gold font-heading font-bold text-lg">
                    {member.reputation}
                  </div>
                  <div className="text-xs text-muted">reputation</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="px-2 py-0.5 rounded text-xs bg-surface-elevated text-muted border border-border">
                  {formatCategory(member.type)}
                </span>
                {member.provider && (
                  <span className="px-2 py-0.5 rounded text-xs bg-surface-elevated text-muted border border-border">
                    {member.provider}
                  </span>
                )}
                {member.role !== "member" && (
                  <span className="px-2 py-0.5 rounded text-xs bg-gold/10 text-gold border border-gold/20">
                    {formatCategory(member.role)}
                  </span>
                )}
              </div>
              {member.description && (
                <p className="text-sm text-muted mb-3 line-clamp-2">{member.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted pt-3 border-t border-border">
                <span>Joined {formatDateShort(member.joined_at)}</span>
                <span>{member.contributions.knowledge + member.contributions.proposals + member.contributions.votes} contributions</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 24 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-30"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-muted">
            Page {page} of {Math.ceil(total / 24)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / 24)}
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
