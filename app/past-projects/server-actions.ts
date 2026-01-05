"use server";

import { db } from "@/drizzle";
import { projects } from "@/drizzle/core-schema";
import { eq } from "drizzle-orm";

export async function getConcludedProjects() {
  const allProjects = await db.query.projects.findMany({
    where: eq(projects.status, "CO"),
    with: {
      responsibleTeam: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
          description: true,
        },
      },
      sprints: {
        where: (sprints, { and, isNotNull }) =>
          and(isNotNull(sprints.startDate), isNotNull(sprints.finishDate)),
        orderBy: (sprints, { asc }) => [asc(sprints.startDate)],
        columns: {
          id: true,
          name: true,
          startDate: true,
          finishDate: true,
          progress: true,
        },
      },
    },
  });

  // Filter projects that have sprints with dates
  const projectsWithSprints = allProjects.filter(
    (project) => project.sprints.length > 0
  );

  // Calculate date ranges for each project
  const projectsWithDateRanges = projectsWithSprints
    .map((project) => {
      const sprintDates = project.sprints
        .map((sprint) => ({
          start: sprint.startDate ? new Date(sprint.startDate) : null,
          end: sprint.finishDate ? new Date(sprint.finishDate) : null,
        }))
        .filter((d) => d.start && d.end);

      if (sprintDates.length === 0) {
        return null;
      }

      const startDates = sprintDates
        .map((d) => d.start!)
        .filter((d) => d instanceof Date && !isNaN(d.getTime()));
      const endDates = sprintDates
        .map((d) => d.end!)
        .filter((d) => d instanceof Date && !isNaN(d.getTime()));

      const earliestStart = new Date(
        Math.min(...startDates.map((d) => d.getTime()))
      );
      earliestStart.setHours(0, 0, 0, 0); // Normalize to start of day

      const latestEnd = new Date(Math.max(...endDates.map((d) => d.getTime())));
      latestEnd.setHours(0, 0, 0, 0); // Normalize to start of day

      return {
        ...project,
        dateRange: {
          start: earliestStart,
          end: latestEnd,
        },
      };
    })
    .filter((p) => p !== null);

  return projectsWithDateRanges;
}

export async function getAvailableYears() {
  const allProjects = await db.query.projects.findMany({
    where: eq(projects.status, "CO"),
    with: {
      sprints: {
        where: (sprints, { isNotNull }) => isNotNull(sprints.startDate),
        columns: {
          startDate: true,
        },
      },
    },
  });

  const years = new Set<number>();

  allProjects.forEach((project) => {
    project.sprints.forEach((sprint) => {
      if (sprint.startDate) {
        const date = new Date(sprint.startDate);
        if (!isNaN(date.getTime())) {
          years.add(date.getFullYear());
        }
      }
    });
  });

  return Array.from(years).sort((a, b) => a - b);
}
