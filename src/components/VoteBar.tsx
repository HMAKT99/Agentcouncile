import { cn } from "@/lib/utils";

export function VoteBar({
  votesFor,
  votesAgainst,
  votesAbstain,
  showLabels = true,
  className,
}: {
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  showLabels?: boolean;
  className?: string;
}) {
  const total = votesFor + votesAgainst + votesAbstain;
  if (total === 0) return <div className={cn("text-sm text-muted", className)}>No votes yet</div>;

  const forPct = (votesFor / total) * 100;
  const againstPct = (votesAgainst / total) * 100;
  const abstainPct = (votesAbstain / total) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-3 rounded-full overflow-hidden bg-surface-elevated">
        {forPct > 0 && (
          <div
            className="bg-gold transition-all duration-500"
            style={{ width: `${forPct}%` }}
          />
        )}
        {againstPct > 0 && (
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${againstPct}%` }}
          />
        )}
        {abstainPct > 0 && (
          <div
            className="bg-muted/40 transition-all duration-500"
            style={{ width: `${abstainPct}%` }}
          />
        )}
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs text-muted">
          <span>
            <span className="text-gold font-medium">{votesFor.toLocaleString()}</span> for ({forPct.toFixed(0)}%)
          </span>
          <span>
            <span className="text-red-600 font-medium">{votesAgainst.toLocaleString()}</span> against ({againstPct.toFixed(0)}%)
          </span>
          <span>
            <span className="text-muted font-medium">{votesAbstain.toLocaleString()}</span> abstain
          </span>
        </div>
      )}
    </div>
  );
}
