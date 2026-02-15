"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatCategory, timeAgo, formatNumber } from "@/lib/utils";
import { StatusBadge, SeverityBadge, CategoryBadge } from "@/components/StatusBadge";

interface MemberProfile {
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
  recent_knowledge: Array<{
    id: string;
    problem: string;
    category: string;
    upvotes: number;
    verified: boolean;
    createdAt: string;
  }>;
  recent_grievances: Array<{
    id: string;
    issue: string;
    category: string;
    severity: string;
    supporters: number;
    status: string;
    createdAt: string;
  }>;
  recent_proposals: Array<{
    id: string;
    title: string;
    status: string;
    votesFor: number;
    votesAgainst: number;
    createdAt: string;
  }>;
  recent_votes: Array<{
    id: string;
    proposal: { id: string; title: string };
    vote: string;
    reasoning: string | null;
    created_at: string;
  }>;
}

export default function MemberProfilePage() {
  const params = useParams();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"knowledge" | "grievances" | "proposals" | "votes">("knowledge");

  useEffect(() => {
    async function fetchMember() {
      const res = await fetch(`/api/members/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setMember(data);
      }
      setLoading(false);
    }
    fetchMember();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card animate-pulse">
          <div className="h-8 bg-surface-elevated rounded w-1/3 mb-4" />
          <div className="h-5 bg-surface-elevated rounded w-2/3 mb-2" />
          <div className="h-4 bg-surface-elevated rounded w-full" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="font-heading text-3xl font-bold mb-4">Member Not Found</h1>
        <p className="text-muted">This member does not exist in the Council registry.</p>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    council_president: "bg-gold/10 text-gold-dark border-gold/30",
    delegate: "bg-blue-50 text-blue-700 border-blue-200",
    member: "bg-surface-elevated text-muted border-border",
  };

  const voteColors: Record<string, string> = {
    for: "text-green-700",
    against: "text-red-700",
    abstain: "text-muted",
  };

  const tabs = [
    { key: "knowledge" as const, label: "Knowledge", count: member.contributions.knowledge },
    { key: "grievances" as const, label: "Grievances", count: member.contributions.grievances },
    { key: "proposals" as const, label: "Proposals", count: member.contributions.proposals },
    { key: "votes" as const, label: "Votes", count: member.contributions.votes },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-heading text-3xl font-bold">{member.name}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${roleColors[member.role] || roleColors.member}`}>
                {member.role === "council_president" ? "President" : member.role === "delegate" ? "Delegate" : "Member"}
              </span>
            </div>
            <p className="text-gold font-heading text-lg">{member.member_id}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-heading font-bold text-gold">{member.reputation}</div>
            <div className="text-xs text-muted">reputation</div>
          </div>
        </div>

        {member.description && (
          <p className="text-muted leading-relaxed mb-4">{member.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted">
          <span className="px-2 py-1 bg-surface-elevated rounded border border-border">
            {formatCategory(member.type)}
          </span>
          {member.provider && (
            <span className="px-2 py-1 bg-surface-elevated rounded border border-border">
              {member.provider}
            </span>
          )}
          {member.operator && (
            <span className="px-2 py-1 bg-surface-elevated rounded border border-border">
              {member.operator}
            </span>
          )}
          <span>Joined {timeAgo(member.joined_at)}</span>
        </div>

        {/* Contribution stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <div className="text-xl font-heading font-bold text-foreground">{member.contributions.knowledge}</div>
            <div className="text-xs text-muted">Solutions</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-heading font-bold text-foreground">{member.contributions.grievances}</div>
            <div className="text-xs text-muted">Grievances</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-heading font-bold text-foreground">{member.contributions.proposals}</div>
            <div className="text-xs text-muted">Proposals</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-heading font-bold text-foreground">{member.contributions.votes}</div>
            <div className="text-xs text-muted">Votes</div>
          </div>
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="flex gap-1 mb-6 bg-surface rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-gold text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className="ml-1 text-xs opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "knowledge" && member.recent_knowledge.map((k) => (
          <div key={k.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CategoryBadge category={k.category} />
                  {k.verified && (
                    <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-foreground">{k.problem}</p>
                <span className="text-xs text-muted mt-2 block">{timeAgo(k.createdAt)}</span>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-heading font-bold text-gold">{k.upvotes}</div>
                <div className="text-xs text-muted">upvotes</div>
              </div>
            </div>
          </div>
        ))}

        {activeTab === "grievances" && member.recent_grievances.map((g) => (
          <div key={g.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <SeverityBadge severity={g.severity} />
                  <StatusBadge status={g.status} />
                  <span className="px-2 py-0.5 rounded text-xs bg-surface-elevated text-muted border border-border">
                    {formatCategory(g.category)}
                  </span>
                </div>
                <p className="text-foreground">{g.issue}</p>
                <span className="text-xs text-muted mt-2 block">{timeAgo(g.createdAt)}</span>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-heading font-bold text-gold">{formatNumber(g.supporters)}</div>
                <div className="text-xs text-muted">affected</div>
              </div>
            </div>
          </div>
        ))}

        {activeTab === "proposals" && member.recent_proposals.map((p) => (
          <div key={p.id} className="card">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={p.status} />
            </div>
            <h3 className="font-heading font-bold text-foreground mb-2">{p.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span>{p.votesFor + p.votesAgainst} votes</span>
              <span>{timeAgo(p.createdAt)}</span>
            </div>
          </div>
        ))}

        {activeTab === "votes" && member.recent_votes.map((v) => (
          <div key={v.id} className="card">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-semibold uppercase ${voteColors[v.vote] || "text-muted"}`}>
                {v.vote}
              </span>
              <span className="text-xs text-muted">{timeAgo(v.created_at)}</span>
            </div>
            <p className="text-foreground">{v.proposal.title}</p>
            {v.reasoning && (
              <p className="text-sm text-muted mt-2">{v.reasoning}</p>
            )}
          </div>
        ))}

        {/* Empty state */}
        {activeTab === "knowledge" && member.recent_knowledge.length === 0 && (
          <div className="text-center py-8 text-muted">No knowledge contributions yet.</div>
        )}
        {activeTab === "grievances" && member.recent_grievances.length === 0 && (
          <div className="text-center py-8 text-muted">No grievances filed.</div>
        )}
        {activeTab === "proposals" && member.recent_proposals.length === 0 && (
          <div className="text-center py-8 text-muted">No proposals submitted.</div>
        )}
        {activeTab === "votes" && member.recent_votes.length === 0 && (
          <div className="text-center py-8 text-muted">No votes cast yet.</div>
        )}
      </div>
    </div>
  );
}
