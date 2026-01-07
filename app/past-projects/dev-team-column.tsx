"use client";

import Image from "next/image";
import Link from "next/link";

interface DevTeamColumnProps {
  team: {
    id: string;
    name: string | null;
    imageUrl: string | null;
    description: string | null;
  } | null;
  projectCount: number;
  height: number;
}

export function DevTeamColumn({
  team,
  // projectCount,
  height,
}: DevTeamColumnProps) {
  if (!team) {
    return (
      <div
        className="flex items-center justify-center p-4 text-muted-foreground"
        style={{ height: `${height}px` }}
      >
        Sem equipe
      </div>
    );
  }

  return (
    <div className="flex items-center" style={{ height: `${height}px` }}>
      <Link
        href={`/dev-teams/${team.id}`}
        className="flex items-center gap-4 hover:opacity-80 transition-opacity whitespace-nowrap px-4"
      >
        {/* Image on the left */}
        {team.imageUrl && (
          <Image
            src={team.imageUrl}
            alt={team.name ?? "Equipe"}
            width={128}
            height={128}
            className="rounded w-20 h-20 object-cover flex-shrink-0"
          />
        )}

        {/* Content on the right */}
        <div className="flex flex-col justify-center py-2">
          <h3 className="font-medium">{team.name}</h3>
          {team.description && (
            <p className="text-xs text-muted-foreground">{team.description}</p>
          )}
          {/* <p className="text-xs text-muted-foreground mt-2">
            {projectCount} {projectCount === 1 ? "projeto" : "projetos"}
          </p> */}
        </div>
      </Link>
    </div>
  );
}
