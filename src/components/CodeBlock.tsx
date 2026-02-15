"use client";

import { useState } from "react";

export function CodeBlock({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(children);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = children;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative group">
      <pre
        className={`bg-surface-elevated rounded-lg p-4 text-sm text-gold-dark overflow-x-auto border border-border ${className}`}
      >
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-background/80 border border-border text-muted hover:text-foreground hover:border-gold/40 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        title="Copy to clipboard"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
