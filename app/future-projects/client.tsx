"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COMPLEXITY_LEVELS } from "@/enums/complexity-levels";
import { AREAS } from "@/enums/areas";
import { FutureProjectTableActions } from "./table-actions";

type FutureProject = {
  id: string;
  name: string | null;
  description: string | null;
  color: string;
  complexity: string | null;
  socialImpact: number | null;
  semarhImpact: number | null;
  estimatedWeeks: number | null;
  createdAt: string | Date | null;
  area: string | null;
  responsibleTeam?: {
    id: string;
    name: string | null;
  } | null;
};

type SortDirection = "asc" | "desc";

type SortColumn =
  | "name"
  | "complexity"
  | "socialImpact"
  | "semarhImpact"
  | "estimatedWeeks"
  | "createdAt"
  | "responsibleTeamName"
  | "area";

type QuickFilter = "all" | "highComplexity" | "noTeam";

type FutureProjectsClientProps = {
  projects: FutureProject[];
};

function getComplexityLabel(value: string | null): string {
  if (!value) return "-";
  const level = COMPLEXITY_LEVELS.find((l) => l.value === value);
  return level?.label ?? value;
}

function formatWeeks(weeks: number | null): string {
  if (!weeks) return "-";
  return `${weeks} semana${weeks > 1 ? "s" : ""}`;
}

function formatNumber(value: number | null): string {
  if (value == null) return "-";
  return value.toString();
}

function formatDate(value: string | Date | null): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

function compareValues(
  a: unknown,
  b: unknown,
  direction: SortDirection
): number {
  if (a == null && b == null) return 0;
  if (a == null) return direction === "asc" ? 1 : -1;
  if (b == null) return direction === "asc" ? -1 : 1;

  // Números
  if (typeof a === "number" && typeof b === "number") {
    const result = a - b;
    return direction === "asc" ? result : -result;
  }

  // Datas (somente quando já são Date válidas)
  if (a instanceof Date && b instanceof Date) {
    const dateA = a;
    const dateB = b;
    const result = dateA.getTime() - dateB.getTime();
    return direction === "asc" ? result : -result;
  }

  // Fallback para string
  const strA = String(a);
  const strB = String(b);
  const result = strA.localeCompare(strB, "pt-BR", { sensitivity: "base" });
  return direction === "asc" ? result : -result;
}

export function FutureProjectsClient({ projects }: FutureProjectsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [complexityFilter, setComplexityFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");

  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    const initialSearch = searchParams.get("q") ?? "";
    const initialComplexity = searchParams.get("complexity") ?? "all";
    const initialTeam = searchParams.get("team") ?? "all";
    const initialArea = searchParams.get("area") ?? "all";
    const initialQuickFilter =
      (searchParams.get("card") as QuickFilter | null) ?? "all";

    setSearch(initialSearch);
    setComplexityFilter(initialComplexity);
    setTeamFilter(initialTeam);
    setAreaFilter(initialArea);
    setQuickFilter(initialQuickFilter);
  }, [searchParams]);

  function updateUrl(params: {
    search?: string;
    complexityFilter?: string;
    teamFilter?: string;
    areaFilter?: string;
    quickFilter?: QuickFilter;
  }) {
    const current = new URLSearchParams(searchParams.toString());

    if (params.search !== undefined) {
      if (params.search) current.set("q", params.search);
      else current.delete("q");
    }

    if (params.complexityFilter !== undefined) {
      if (params.complexityFilter !== "all")
        current.set("complexity", params.complexityFilter);
      else current.delete("complexity");
    }

    if (params.teamFilter !== undefined) {
      if (params.teamFilter !== "all") current.set("team", params.teamFilter);
      else current.delete("team");
    }

    if (params.areaFilter !== undefined) {
      if (params.areaFilter !== "all") {
        current.set("area", params.areaFilter);
      } else {
        current.delete("area");
      }
    }

    if (params.quickFilter !== undefined) {
      if (params.quickFilter !== "all") current.set("card", params.quickFilter);
      else current.delete("card");
    }

    const queryString = current.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }

  const uniqueTeams = useMemo(() => {
    const names = new Set<string>();
    projects.forEach((project) => {
      if (project.responsibleTeam?.name) {
        names.add(project.responsibleTeam.name);
      }
    });
    return Array.from(names).sort((a, b) =>
      a.localeCompare(b, "pt-BR", { sensitivity: "base" })
    );
  }, [projects]);

  const totalCount = projects.length;
  const highComplexityCount = projects.filter(
    (project) => project.complexity === "A" || project.complexity === "MA"
  ).length;
  const noTeamCount = projects.filter(
    (project) => !project.responsibleTeam?.id
  ).length;

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return projects.filter((project) => {
      const name = project.name ?? "";
      const description = project.description ?? "";
      const teamName = project.responsibleTeam?.name ?? "";

      const matchesSearch =
        !normalizedSearch ||
        name.toLowerCase().includes(normalizedSearch) ||
        description.toLowerCase().includes(normalizedSearch) ||
        teamName.toLowerCase().includes(normalizedSearch) ||
        project.id.toLowerCase().includes(normalizedSearch);

      const matchesComplexity =
        complexityFilter === "all" ||
        project.complexity === complexityFilter ||
        (!project.complexity && complexityFilter === "none");

      const matchesTeam =
        teamFilter === "all" ||
        (teamFilter === "none" && !project.responsibleTeam?.id) ||
        project.responsibleTeam?.name === teamFilter;

      const matchesDepartment =
        areaFilter === "all" ||
        (areaFilter === "none" && !project.area) ||
        project.area === areaFilter;

      const matchesQuickFilter =
        quickFilter === "all" ||
        (quickFilter === "highComplexity" &&
          (project.complexity === "A" || project.complexity === "MA")) ||
        (quickFilter === "noTeam" && !project.responsibleTeam?.id);

      return (
        matchesSearch &&
        matchesComplexity &&
        matchesTeam &&
        matchesDepartment &&
        matchesQuickFilter
      );
    });
  }, [projects, search, complexityFilter, teamFilter, areaFilter, quickFilter]);

  const sortedProjects = useMemo(() => {
    if (!sortColumn) {
      return filteredProjects;
    }

    const copy = [...filteredProjects];

    copy.sort((a, b) => {
      switch (sortColumn) {
        case "name":
          return compareValues(a.name, b.name, sortDirection);
        case "complexity":
          return compareValues(a.complexity, b.complexity, sortDirection);
        case "socialImpact":
          return compareValues(a.socialImpact, b.socialImpact, sortDirection);
        case "semarhImpact":
          return compareValues(a.semarhImpact, b.semarhImpact, sortDirection);
        case "estimatedWeeks":
          return compareValues(
            a.estimatedWeeks,
            b.estimatedWeeks,
            sortDirection
          );
        case "createdAt":
          return compareValues(a.createdAt, b.createdAt, sortDirection);
        case "responsibleTeamName":
          return compareValues(
            a.responsibleTeam?.name ?? "",
            b.responsibleTeam?.name ?? "",
            sortDirection
          );
        case "area":
          return compareValues(a.area ?? "", b.area ?? "", sortDirection);
        default:
          return 0;
      }
    });

    return copy;
  }, [filteredProjects, sortColumn, sortDirection]);

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection((prevDirection) =>
        prevDirection === "asc" ? "desc" : "asc"
      );
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  function getSortIcon(column: SortColumn) {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground" />;
    }

    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-3 w-3" />;
    }

    return <ArrowDown className="ml-2 h-3 w-3" />;
  }

  function handleQuickFilterChange(next: QuickFilter) {
    setQuickFilter(next);
    updateUrl({ quickFilter: next });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    updateUrl({ search: value });
  }

  function handleComplexityChange(value: string) {
    setComplexityFilter(value);
    updateUrl({ complexityFilter: value });
  }

  function handleTeamChange(value: string) {
    setTeamFilter(value);
    updateUrl({ teamFilter: value });
  }

  function handleAreaChange(value: string) {
    setAreaFilter(value);
    updateUrl({ areaFilter: value });
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Total"
          value={totalCount}
          description="Projetos futuros cadastrados"
          active={quickFilter === "all"}
          onClick={() => handleQuickFilterChange("all")}
        />
        <SummaryCard
          title="Alta complexidade"
          value={highComplexityCount}
          description="Projetos com maior esforço"
          active={quickFilter === "highComplexity"}
          onClick={() => handleQuickFilterChange("highComplexity")}
        />
        <SummaryCard
          title="Sem equipe"
          value={noTeamCount}
          description="Projetos ainda sem time responsável"
          active={quickFilter === "noTeam"}
          onClick={() => handleQuickFilterChange("noTeam")}
        />
      </div>

      {/* Filtros */}
      <div className="grid gap-4 md:grid-cols-[2fr,1fr,1fr,1fr] items-end">
        <div className="space-y-1">
          <Label htmlFor="search">Busca global</Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <Input
              id="search"
              placeholder="Buscar por nome, descrição, equipe ou ID..."
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-4 justify-between">
        <div className="space-y-1 flex-1 min-w-0">
          <Label htmlFor="complexity">Complexidade</Label>
          <Select
            value={complexityFilter}
            onValueChange={handleComplexityChange}
            
          >
            <SelectTrigger id="complexity" className="w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="none">Sem complexidade definida</SelectItem>
              {COMPLEXITY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <Label htmlFor="team">Equipe responsável</Label>
          <Select value={teamFilter} onValueChange={handleTeamChange}>
            <SelectTrigger id="team" className="w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="none">Sem equipe</SelectItem>
              {uniqueTeams.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <Label htmlFor="area">Área</Label>
          <Select
            value={areaFilter}
            onValueChange={handleAreaChange}
          >
            <SelectTrigger id="area" className="w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="none">Sem área</SelectItem>
              {AREAS.map((area) => (
                <SelectItem key={area.value} value={area.value}>
                  {area.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("name")}
                >
                  <span>Nome</span>
                  {getSortIcon("name")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("complexity")}
                >
                  <span>Complexidade</span>
                  {getSortIcon("complexity")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("socialImpact")}
                >
                  <span>Impacto<br/> social</span>
                  {getSortIcon("socialImpact")}
                </button>
              </TableHead>
              <TableHead>         
                <button
                  type="button"
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("semarhImpact")}
                >
                  <span>Impacto <br/> SEMARH</span>
                  {getSortIcon("semarhImpact")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("estimatedWeeks")}
                >
                  <span>Tempo<br/> estimado</span>
                  {getSortIcon("estimatedWeeks")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("area")}
                >
                  <span>Área</span>
                  {getSortIcon("area")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("responsibleTeamName")}
                >
                  <span>Equipe<br/> responsável</span>
                  {getSortIcon("responsibleTeamName")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("createdAt")}
                >
                  <span>Criado em</span>
                  {getSortIcon("createdAt")}
                </button>
              </TableHead>
              <TableHead className="w-[80px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProjects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum projeto encontrado para os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              sortedProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium max-w-[250px] whitespace-normal">
                    <div className="flex flex-col gap-1">
                      <span>{project.name ?? "-"}</span>
                      {project.description && (
                        <span className="text-xs text-muted-foreground line-clamp-2 truncate">
                          {project.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.complexity ? (
                      <Badge variant="outline">
                        {getComplexityLabel(project.complexity)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatNumber(project.socialImpact)}</TableCell>
                  <TableCell>{formatNumber(project.semarhImpact)}</TableCell>
                  <TableCell>{formatWeeks(project.estimatedWeeks)}</TableCell>
                  <TableCell>
                    {project.area ? (
                      AREAS.find((d) => d.value === project.area)?.label ??
                      project.area
                    ) : (
                      <span className="text-muted-foreground">Sem área</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.responsibleTeam?.name ?? (
                      <span className="text-muted-foreground">Sem equipe</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(project.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <FutureProjectTableActions projectId={project.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: number;
  description: string;
  active?: boolean;
  onClick?: () => void;
};

function SummaryCard({
  title,
  value,
  description,
  active,
  onClick,
}: SummaryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left"
      aria-pressed={active}
    >
      <Card
        className={`transition-colors ${
          active
            ? "border-primary bg-primary/5"
            : "hover:border-primary/60 hover:bg-muted/40"
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{value}</div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </button>
  );
}

