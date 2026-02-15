"use client";

import { useEffect, useState } from "react";
import { timeAgo, truncate } from "@/lib/utils";
import { StatusBadge, CategoryBadge } from "@/components/StatusBadge";
import { VoteBar } from "@/components/VoteBar";

interface Proposal {
  id: string;
  title: string;
  text: string;
  category: string;
  proposed_by: { id: string; name: string; member_id: string; type: string };
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  total_votes: number;
  status: string;
  deliberation: Array<{
    member_id: string;
    member_name: string;
    position: string;
    reasoning: string;
    timestamp: string;
  }>;
  created_at: string;
  voting_ends_at: string | null;
}

export default function CouncilPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"deliberation" | "voting" | "passed">("deliberation");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProposals() {
      setLoading(true);
      const res = await fetch("/api/proposals?pageSize=50");
      const data = await res.json();
      setProposals(data.data || []);
      setLoading(false);
    }
    fetchProposals();
  }, []);

  const tabs = [
    { key: "deliberation" as const, label: "Deliberation", statuses: ["deliberation"] },
    { key: "voting" as const, label: "Active Votes", statuses: ["voting"] },
    { key: "passed" as const, label: "Passed / Rejected", statuses: ["passed", "rejected", "implemented"] },
  ];

  const filtered = proposals.filter((p) =>
    tabs.find((t) => t.key === activeTab)?.statuses.includes(p.status)
  );

  const positionColors: Record<string, string> = {
    support: "text-green-700",
    oppose: "text-red-700",
    amend: "text-yellow-700",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold mb-4">
          Council <span className="text-gold">Chamber</span>
        </h1>
        <p className="text-muted text-lg">
          Where governance happens. Deliberate. Vote. Decide.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-surface rounded-lg p-1 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-gold text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className="ml-1 text-xs opacity-70">
              ({proposals.filter((p) => tab.statuses.includes(p.status)).length})
            </span>
          </button>
        ))}
      </div>

      {/* Proposals */}
      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-surface-elevated rounded w-3/4 mb-4" />
              <div className="h-4 bg-surface-elevated rounded w-full mb-2" />
              <div className="h-4 bg-surface-elevated rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-lg">No proposals in this phase.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((proposal) => (
            <div key={proposal.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={proposal.status} />
                    <CategoryBadge category={proposal.category} />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    {proposal.title}
                  </h2>
                </div>
              </div>

              <div className="text-muted text-sm leading-relaxed mb-4">
                {expanded === proposal.id ? (
                  <pre className="whitespace-pre-wrap font-body">{proposal.text}</pre>
                ) : (
                  truncate(proposal.text, 300)
                )}
                {proposal.text.length > 300 && (
                  <button
                    onClick={() => setExpanded(expanded === proposal.id ? null : proposal.id)}
                    className="text-gold ml-1 hover:text-gold-dark"
                  >
                    {expanded === proposal.id ? "Show less" : "Read more"}
                  </button>
                )}
              </div>

              {/* Vote bar for voting/passed proposals */}
              {(proposal.status === "voting" || proposal.status === "passed" || proposal.status === "rejected") && (
                <div className="mb-4">
                  <VoteBar
                    votesFor={proposal.votes_for}
                    votesAgainst={proposal.votes_against}
                    votesAbstain={proposal.votes_abstain}
                  />
                </div>
              )}

              {/* Voting countdown */}
              {proposal.status === "voting" && proposal.voting_ends_at && (
                <div className="mb-4 text-sm text-gold">
                  Voting ends: {new Date(proposal.voting_ends_at).toLocaleString()}
                </div>
              )}

              {/* Deliberation thread */}
              {Array.isArray(proposal.deliberation) && proposal.deliberation.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                    Deliberation ({proposal.deliberation.length} positions)
                  </h3>
                  <div className="space-y-3">
                    {proposal.deliberation.map((d, i) => (
                      <div key={i} className="bg-surface-elevated rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {d.member_name}
                          </span>
                          <span
                            className={`text-xs font-medium uppercase ${
                              positionColors[d.position] || "text-muted"
                            }`}
                          >
                            {d.position}
                          </span>
                          <span className="text-xs text-muted">{timeAgo(d.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted">{d.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted">
                <span>Proposed by {proposal.proposed_by.name}</span>
                <span>{timeAgo(proposal.created_at)}</span>
                <span>{proposal.total_votes} votes cast</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
