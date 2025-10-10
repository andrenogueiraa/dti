"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SimpleMarkdownPreviewProps {
  content: string;
  typeLabel?: string;
  date?: string;
  className?: string;
}

export function SimpleMarkdownPreview({
  content,
  typeLabel,
  date,
  className,
}: SimpleMarkdownPreviewProps) {
  const renderLine = (line: string) => {
    // Render headings
    if (line.startsWith("# ")) {
      return <h2>{line.slice(2)}</h2>;
    }
    if (line.startsWith("## ")) {
      return <h3>{line.slice(3)}</h3>;
    }
    if (line.startsWith("### ")) {
      return <h4>{line.slice(4)}</h4>;
    }

    // Render bold and italic
    let formatted = line;

    // Bold: **text** or __text__
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/__(.+?)__/g, "<strong>$1</strong>");

    // Italic: *text* or _text_ (but not if part of ** or __)
    formatted = formatted.replace(
      /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
      "<em>$1</em>"
    );
    formatted = formatted.replace(
      /(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g,
      "<em>$1</em>"
    );

    if (formatted === "") {
      return <br />;
    }

    return <p dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const lines = content.split("\n");

  return (
    <div className={cn("prose max-w-none", className)}>
      <header className="flex justify-between mb-6 relative">
        {typeLabel && <h2 className="w-full">{typeLabel}</h2>}
        {date && <p className="text-lg absolute right-0 top-2">{date}</p>}
      </header>
      {lines.map((line, index) => (
        <React.Fragment key={index}>{renderLine(line)}</React.Fragment>
      ))}
    </div>
  );
}
