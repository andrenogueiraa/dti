"use client";

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { CalendarHeader } from "./calendar-header";
import { DevTeamColumn } from "./dev-team-column";
import { ProjectTimeline } from "./project-timeline";
import { CALENDAR_CONSTANTS } from "./constants";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

type Project = NonNullable<
  Awaited<
    ReturnType<typeof import("./server-actions").getConcludedProjects>
  >[number]
>;

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

interface PastProjectsCalendarProps {
  initialProjects: Project[];
  allDevTeams: Array<{
    id: string;
    name: string | null;
    imageUrl: string | null;
    description: string | null;
  }>;
}

const { PIXELS_PER_DAY } = CALENDAR_CONSTANTS;

export function PastProjectsCalendar({
  initialProjects,
  allDevTeams,
}: PastProjectsCalendarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group projects by dev team and ensure all teams are included
  const projectsByTeam = useMemo(() => {
    // Create a map of teamId -> projects
    const projectsByTeamId = new Map<string, Project[]>();

    initialProjects.forEach((project) => {
      const teamId = project.responsibleTeam?.id || "no-team";
      if (!projectsByTeamId.has(teamId)) {
        projectsByTeamId.set(teamId, []);
      }
      projectsByTeamId.get(teamId)!.push(project);
    });

    // Create entries for all dev teams, including those without projects
    return allDevTeams.map((team) => ({
      team,
      projects: projectsByTeamId.get(team.id) || [],
    }));
  }, [initialProjects, allDevTeams]);

  // Calculate overall date range from all projects
  const { overallStart, overallEnd, calendarWidth } = useMemo(() => {
    if (initialProjects.length === 0) {
      const today = new Date();
      return {
        overallStart: today,
        overallEnd: today,
        calendarWidth: PIXELS_PER_DAY,
      };
    }

    // Get all start and end dates from all sprints
    const allStartDates = initialProjects.flatMap((project) =>
      project.sprints
        .map((sprint) => (sprint.startDate ? new Date(sprint.startDate) : null))
        .filter((d): d is Date => d !== null && !isNaN(d.getTime()))
    );

    const allEndDates = initialProjects.flatMap((project) =>
      project.sprints
        .map((sprint) =>
          sprint.finishDate ? new Date(sprint.finishDate) : null
        )
        .filter((d): d is Date => d !== null && !isNaN(d.getTime()))
    );

    if (allStartDates.length === 0 || allEndDates.length === 0) {
      const today = new Date();
      return {
        overallStart: today,
        overallEnd: today,
        calendarWidth: PIXELS_PER_DAY,
      };
    }

    const overallStart = new Date(
      Math.min(...allStartDates.map((d) => d.getTime()))
    );
    overallStart.setHours(0, 0, 0, 0); // Normalize to start of day

    const latestProjectEnd = new Date(
      Math.max(...allEndDates.map((d) => d.getTime()))
    );
    latestProjectEnd.setHours(0, 0, 0, 0); // Normalize to start of day

    // Calendar should always end at today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for consistent comparison
    const overallEnd = today > latestProjectEnd ? today : latestProjectEnd;

    const totalDays =
      Math.ceil(
        (overallEnd.getTime() - overallStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const calendarWidth = totalDays * PIXELS_PER_DAY;

    return {
      overallStart,
      overallEnd,
      calendarWidth,
    };
  }, [initialProjects]);

  // Calculate position for a date (absolute from timeline start)
  const getDatePosition = useCallback(
    (date: Date) => {
      const overallStartTime = overallStart.getTime();
      const dateTime = date.getTime();
      const diffDays = Math.floor(
        (dateTime - overallStartTime) / (1000 * 60 * 60 * 24)
      );
      return Math.max(0, diffDays * PIXELS_PER_DAY);
    },
    [overallStart]
  );

  // Calculate "Today" position
  const todayPosition = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return getDatePosition(today);
  }, [getDatePosition]);

  // Check if "Today" is visible in viewport
  const [isTodayVisible, setIsTodayVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const checkTodayVisibility = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const viewportWidth = scrollContainer.clientWidth;
      const isVisible =
        todayPosition >= scrollLeft &&
        todayPosition <= scrollLeft + viewportWidth;
      setIsTodayVisible(isVisible);
    };

    checkTodayVisibility();
    scrollContainer.addEventListener("scroll", checkTodayVisibility);
    return () =>
      scrollContainer.removeEventListener("scroll", checkTodayVisibility);
  }, [todayPosition]);

  // Calculate uniform row height based on viewport height
  const [uniformRowHeight, setUniformRowHeight] = useState(100);

  useEffect(() => {
    // Calculate height: viewport height / (number of teams + 1 for header)
    const numberOfRows = projectsByTeam.length + 1;
    const calculatedHeight = window.innerHeight / numberOfRows;
    setUniformRowHeight(calculatedHeight);
  }, [projectsByTeam.length]);

  // Track current year based on scroll position
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  // Calculate which year is currently visible based on scroll position
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !overallStart || !overallEnd) return;

    const updateCurrentYear = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const viewportWidth = scrollContainer.clientWidth;
      const centerPosition = scrollLeft + viewportWidth / 2;

      // Convert pixel position to date using millisecond-based calculation
      const daysFromStart = centerPosition / PIXELS_PER_DAY;
      const centerDate = new Date(
        overallStart.getTime() + daysFromStart * 24 * 60 * 60 * 1000
      );
      // Normalize to start of day for consistency
      centerDate.setHours(0, 0, 0, 0);

      setCurrentYear(centerDate.getFullYear());
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      updateCurrentYear();
    });

    // Update on scroll
    scrollContainer.addEventListener("scroll", updateCurrentYear);

    return () => {
      cancelAnimationFrame(rafId);
      scrollContainer.removeEventListener("scroll", updateCurrentYear);
    };
  }, [overallStart, overallEnd]);

  // Auto-scroll to the right (most recent dates) on mount
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Scroll to the right
    scrollContainer.scrollLeft = scrollContainer.scrollWidth;

    // Update year after scroll completes
    const updateYearAfterScroll = () => {
      if (!overallStart || !overallEnd) return;

      const scrollLeft = scrollContainer.scrollLeft;
      const viewportWidth = scrollContainer.clientWidth;
      const centerPosition = scrollLeft + viewportWidth / 2;

      // Convert pixel position to date using millisecond-based calculation
      const daysFromStart = centerPosition / PIXELS_PER_DAY;
      const centerDate = new Date(
        overallStart.getTime() + daysFromStart * 24 * 60 * 60 * 1000
      );
      centerDate.setHours(0, 0, 0, 0);

      setCurrentYear(centerDate.getFullYear());
    };

    // Use multiple timeouts to ensure year updates after scroll
    const timeout1 = setTimeout(updateYearAfterScroll, 50);
    const timeout2 = setTimeout(updateYearAfterScroll, 200);
    const rafId = requestAnimationFrame(updateYearAfterScroll);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      cancelAnimationFrame(rafId);
    };
  }, [initialProjects, overallStart, overallEnd]);

  return (
    <div className="w-full h-screen flex overflow-hidden">
      {/* Frozen Dev Team Column - fixed position */}
      <div className="flex-shrink-0 border-r bg-background/75">
        <div className="sticky top-0 z-20 bg-background border-b">
          <div
            className="text-sm tracking-wide p-4"
            style={{ height: `${uniformRowHeight}px` }}
          >
            <span className="text-muted-foreground">Projetos</span>
            <br />
            <span className="font-medium text-primary uppercase">
              Concluídos
            </span>
          </div>
        </div>
        <div className="bg-card">
          {projectsByTeam.map(({ team, projects }, index) => (
            <div
              key={team?.id || `no-team-${index}`}
              style={{ height: `${uniformRowHeight}px` }}
            >
              <DevTeamColumn
                team={team}
                projectCount={projects.length}
                height={uniformRowHeight}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Calendar Area - only horizontal scroll */}
      <div className="flex-1 relative min-w-0">
        {/* Fixed Year Indicator - Positioned outside scroll container */}
        {currentYear !== null && (
          <div className="absolute top-0 left-0 z-50 bg-primary text-primary-foreground px-4 py-1.5 font-bold text-sm shadow-lg rounded-br-md pointer-events-none">
            {currentYear}
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className="w-full h-full overflow-x-auto overflow-y-hidden relative"
        >
          {/* "Today" Vertical Marker */}
          {todayPosition >= 0 && todayPosition <= calendarWidth && (
            <div
              className="absolute top-0 bottom-0 border-l-2 border-primary z-30 pointer-events-none"
              style={{ left: `${todayPosition}px` }}
            >
              <div className="absolute -top-0 -left-6 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-sm font-semibold whitespace-nowrap">
                HOJE
              </div>
            </div>
          )}

          <div
            className="inline-block"
            style={{ minWidth: `${calendarWidth}px` }}
          >
            {/* Calendar Header */}
            <div
              className="sticky top-0 z-10 bg-background border-b"
              style={{ height: `${uniformRowHeight}px` }}
            >
              <CalendarHeader
                startDate={overallStart}
                endDate={overallEnd}
                pixelsPerDay={PIXELS_PER_DAY}
              />
            </div>

            {/* Calendar Rows */}
            <div className="bg-muted">
              {projectsByTeam.map(({ team, projects }, index) => (
                <div
                  key={team?.id || `no-team-${index}`}
                  className="border-b border-border/25 last:border-b-0 relative"
                  style={{ height: `${uniformRowHeight}px` }}
                >
                  {projects.map((project) => (
                    <ProjectTimeline
                      key={project.id}
                      project={project}
                      yearStart={overallStart}
                      getDatePosition={getDatePosition}
                      pixelsPerDay={PIXELS_PER_DAY}
                      rowHeight={uniformRowHeight}
                      allProjects={projects}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* "Back to Today" Floating Button */}
        {!isTodayVisible && (
          <Button
            size="icon"
            className="absolute bottom-4 right-4 z-50 rounded-full shadow-xl h-12 w-12"
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                  left:
                    todayPosition - scrollContainerRef.current.clientWidth / 2,
                  behavior: "smooth",
                });
              }
            }}
            title="Voltar para hoje"
          >
            <ArrowRightIcon className="h-10 w-10" />
          </Button>
        )}
      </div>
    </div>
  );
}
