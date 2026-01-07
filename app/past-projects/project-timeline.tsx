"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getColorClassName } from "@/enums/colors";
import { formatLocalDate } from "@/lib/date-utils";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CALENDAR_CONSTANTS } from "./constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Project = NonNullable<
  Awaited<
    ReturnType<typeof import("./server-actions").getConcludedProjects>
  >[number]
>;

interface ProjectTimelineProps {
  project: Project;
  yearStart: Date;
  getDatePosition: (date: Date) => number;
  pixelsPerDay: number;
  rowHeight: number;
  allProjects: Project[];
}

interface SprintPosition {
  sprint: Project["sprints"][number];
  left: number;
  width: number;
  top: number;
  height: number;
}

export function ProjectTimeline({
  project,
  yearStart,
  getDatePosition,
  pixelsPerDay,
  rowHeight,
  allProjects,
}: ProjectTimelineProps) {
  const sprintPositions = useMemo(() => {
    if (!project.dateRange || project.sprints.length === 0) {
      return null;
    }

    // Calculate project position
    // Normalize start date to beginning of day
    const projectStartDate = new Date(project.dateRange.start);
    projectStartDate.setHours(0, 0, 0, 0);
    const projectLeft = getDatePosition(projectStartDate);

    // Add 1 day to end date to include the last day completely (same as sprints)
    const projectEndDatePlusOne = new Date(project.dateRange.end);
    projectEndDatePlusOne.setDate(projectEndDatePlusOne.getDate() + 1);
    projectEndDatePlusOne.setHours(0, 0, 0, 0);
    const projectRight = getDatePosition(projectEndDatePlusOne);
    const projectWidth = projectRight - projectLeft;

    // Check for overlapping projects and calculate stacking
    const allProjectsWithDates = allProjects
      .map((otherProject) => {
        if (!otherProject.dateRange) return null;
        const otherLeft = getDatePosition(otherProject.dateRange.start);
        const otherEndDatePlusOne = new Date(otherProject.dateRange.end);
        otherEndDatePlusOne.setDate(otherEndDatePlusOne.getDate() + 1);
        const otherRight = getDatePosition(otherEndDatePlusOne);
        return {
          project: otherProject,
          left: otherLeft,
          right: otherRight,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => a.left - b.left);

    // Find overlapping projects
    const overlappingProjects = allProjectsWithDates.filter((other) => {
      if (other.project.id === project.id) return false;
      return (
        (projectLeft < other.right && projectRight > other.left) ||
        (other.left < projectRight && other.right > projectLeft)
      );
    });

    // Calculate project height based on overlaps
    const hasOverlaps = overlappingProjects.length > 0;
    const totalOverlappingProjects = hasOverlaps
      ? overlappingProjects.length + 1
      : 1; // +1 for current project
    const projectHeight = hasOverlaps
      ? rowHeight / totalOverlappingProjects
      : rowHeight;

    // Calculate vertical offset for stacking overlapping projects
    // Sort overlapping projects by start date to determine stacking order
    const allOverlapping = [
      { project, left: projectLeft, right: projectRight },
      ...overlappingProjects.map((o) => ({
        project: o.project,
        left: o.left,
        right: o.right,
      })),
    ].sort((a, b) => a.left - b.left);

    const currentProjectIndex = allOverlapping.findIndex(
      (p) => p.project.id === project.id
    );
    const verticalOffset = hasOverlaps
      ? currentProjectIndex * projectHeight
      : 0;

    // Sort sprints by start date
    const sortedSprints = [...project.sprints]
      .map((sprint) => ({
        sprint,
        start: sprint.startDate ? new Date(sprint.startDate) : null,
        end: sprint.finishDate ? new Date(sprint.finishDate) : null,
      }))
      .filter((s) => s.start && s.end)
      .sort((a, b) => a.start!.getTime() - b.start!.getTime());

    // Calculate sprint positions with stacking
    // First pass: assign sprints to rows
    const sprintRows: Array<
      Array<{
        sprintData: (typeof sortedSprints)[number];
        left: number;
        right: number;
        width: number;
      }>
    > = [];

    sortedSprints.forEach((sprintData) => {
      // Normalize dates to beginning of day for consistency
      const sprintStartDate = new Date(sprintData.start!);
      sprintStartDate.setHours(0, 0, 0, 0);
      const sprintLeft = getDatePosition(sprintStartDate);

      // Add 1 day to end date to include the last day completely
      const endDatePlusOne = new Date(sprintData.end!);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
      endDatePlusOne.setHours(0, 0, 0, 0);
      const sprintRight = getDatePosition(endDatePlusOne);
      const sprintWidth = sprintRight - sprintLeft;

      // Find a row where this sprint doesn't overlap
      let rowIndex = 0;
      for (let i = 0; i < sprintRows.length; i++) {
        const row = sprintRows[i];
        const hasOverlap = row.some((existing) => {
          return (
            (sprintLeft < existing.right && sprintRight > existing.left) ||
            (existing.left < sprintRight && existing.right > sprintLeft)
          );
        });

        if (!hasOverlap) {
          rowIndex = i;
          break;
        }
        rowIndex = i + 1;
      }

      // Add to appropriate row
      if (!sprintRows[rowIndex]) {
        sprintRows[rowIndex] = [];
      }
      sprintRows[rowIndex].push({
        sprintData,
        left: sprintLeft,
        right: sprintRight,
        width: sprintWidth,
      });
    });

    // Second pass: calculate positions with adjusted heights
    const { TITLE_HEIGHT, SPRINT_HEIGHT, SPRINT_MIN_HEIGHT, SPRINT_SPACING } =
      CALENDAR_CONSTANTS;
    const availableHeight = projectHeight - TITLE_HEIGHT - 8; // Subtract title and padding
    const maxSprintRows = Math.max(1, sprintRows.length);
    const sprintHeight = Math.min(
      SPRINT_HEIGHT,
      Math.max(
        SPRINT_MIN_HEIGHT,
        availableHeight / maxSprintRows - SPRINT_SPACING
      )
    );
    const sprintSpacing = SPRINT_SPACING;

    const positions: SprintPosition[] = [];
    sprintRows.forEach((row, rowIndex) => {
      row.forEach(({ sprintData, left, right }) => {
        const sprintTop =
          rowIndex * (sprintHeight + sprintSpacing) +
          TITLE_HEIGHT +
          sprintSpacing;

        // Calculate relative position within project card
        const relativeLeft = left - projectLeft;
        const relativeRight = right - projectLeft;

        // Ensure sprint doesn't exceed project boundaries
        const clampedLeft = Math.max(0, relativeLeft);
        const clampedRight = Math.min(projectWidth, relativeRight);
        const clampedWidth = clampedRight - clampedLeft;

        positions.push({
          sprint: sprintData.sprint,
          left: clampedLeft,
          width: Math.max(0, clampedWidth),
          top: sprintTop,
          height: sprintHeight,
        });
      });
    });

    return {
      projectLeft,
      projectWidth,
      positions,
      totalHeight: projectHeight, // Use calculated project height
      projectHeight,
      hasOverlaps,
      verticalOffset,
    } as {
      projectLeft: number;
      projectWidth: number;
      positions: SprintPosition[];
      totalHeight: number;
      projectHeight: number;
      hasOverlaps: boolean;
      verticalOffset: number;
    };
  }, [
    project,
    yearStart,
    getDatePosition,
    pixelsPerDay,
    rowHeight,
    allProjects,
  ]);

  if (
    !sprintPositions ||
    !sprintPositions.positions ||
    sprintPositions.positions.length === 0
  ) {
    return null;
  }

  const {
    projectLeft,
    projectWidth,
    positions,
    projectHeight,
    verticalOffset,
  } = sprintPositions;
  const colorClass = getColorClassName(project.color);

  return (
    <div
      className="absolute"
      style={{
        left: `${projectLeft}px`,
        width: `${projectWidth}px`,
        height: `${projectHeight}px`,
        top: `${verticalOffset}px`,
      }}
    >
      <Link
        href={`/projects/${project.id}`}
        className={cn(
          "block h-full rounded-md shadow hover:shadow-lg relative hover:ring",
          colorClass
        )}
      >
        {/* Project Name - Inside card at top */}
        <div className="absolute top-1 left-2 right-2 text-xs font-semibold text-foreground truncate z-10">
          {project.name}
        </div>

        {/* Sprint Segments */}
        {positions.map((pos) => (
          <Tooltip key={pos.sprint.id}>
            <TooltipTrigger asChild className="border-r border-black">
              <div
                className="absolute group cursor-pointer"
                style={{
                  left: `${pos.left}px`,
                  width: `${pos.width}px`,
                  top: `${pos.top}px`,
                  height: `${pos.height}px`,
                }}
              >
                {/* Sprint Name */}
                <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                  <span className="text-xs font-medium text-muted-foreground truncate whitespace-nowrap">
                    {pos.sprint.name}
                  </span>
                </div>

                {/* Progress Indicator */}
                {pos.sprint.progress !== null &&
                  pos.sprint.progress !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 h-1">
                      <Progress
                        value={pos.sprint.progress}
                        className="h-full rounded-none"
                      />
                    </div>
                  )}
              </div>
            </TooltipTrigger>
            <TooltipContent
              className="w-80 bg-card text-card-foreground "
              side="top"
            >
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-semibold">{pos.sprint.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatLocalDate(pos.sprint.startDate, "pt-BR")} -{" "}
                    {formatLocalDate(pos.sprint.finishDate, "pt-BR")}
                  </p>
                </div>
                {pos.sprint.progress !== null &&
                  pos.sprint.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">
                          {pos.sprint.progress}%
                        </span>
                      </div>
                      <Progress value={pos.sprint.progress} className="h-2" />
                    </div>
                  )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </Link>
    </div>
  );
}
