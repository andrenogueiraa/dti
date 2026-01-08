"use server";

import { db } from "@/drizzle";
import { user } from "@/drizzle/auth-schema";
import { inArray } from "drizzle-orm";

export type Activity = {
  id: string;
  type: "project" | "task" | "sprint" | "doc";
  action: "created" | "updated";
  entityName: string | null;
  entityId: string;
  user: { id: string; name: string; image: string | null };
  timestamp: Date;
  metadata?: {
    projectName?: string;
    sprintName?: string;
    tags?: string[];
    status?: string;
    color?: string;
    docType?: string;
  };
};

export async function getActivities(limit: number = 50): Promise<Activity[]> {
  // Fetch all data in parallel
  const [allProjects, allTasks, allSprints, allDocs] = await Promise.all([
    db.query.projects.findMany({
      columns: {
        id: true,
        name: true,
        createdAt: true,
        createdBy: true,
        updatedAt: true,
        updatedBy: true,
        color: true,
        status: true,
      },
      orderBy: (projects, { desc }) => [desc(projects.createdAt)],
      limit,
    }),
    db.query.tasks.findMany({
      columns: {
        id: true,
        name: true,
        createdAt: true,
        createdBy: true,
        updatedAt: true,
        updatedBy: true,
        tags: true,
        status: true,
      },
      with: {
        sprint: {
          columns: { name: true },
          with: {
            project: {
              columns: { name: true },
            },
          },
        },
      },
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
      limit,
    }),
    db.query.sprints.findMany({
      columns: {
        id: true,
        name: true,
        createdAt: true,
        createdBy: true,
        updatedAt: true,
        updatedBy: true,
      },
      with: {
        project: {
          columns: { name: true },
        },
      },
      orderBy: (sprints, { desc }) => [desc(sprints.createdAt)],
      limit,
    }),
    db.query.docs.findMany({
      columns: {
        id: true,
        content: true,
        type: true,
        createdAt: true,
        createdBy: true,
        updatedAt: true,
        updatedBy: true,
      },
      orderBy: (docs, { desc }) => [desc(docs.createdAt)],
      limit,
    }),
  ]);

  // Collect all unique user IDs
  const userIds = new Set<string>();

  for (const p of allProjects) {
    if (p.createdBy) userIds.add(p.createdBy);
    if (p.updatedBy) userIds.add(p.updatedBy);
  }
  for (const t of allTasks) {
    if (t.createdBy) userIds.add(t.createdBy);
    if (t.updatedBy) userIds.add(t.updatedBy);
  }
  for (const s of allSprints) {
    if (s.createdBy) userIds.add(s.createdBy);
    if (s.updatedBy) userIds.add(s.updatedBy);
  }
  for (const d of allDocs) {
    if (d.createdBy) userIds.add(d.createdBy);
    if (d.updatedBy) userIds.add(d.updatedBy);
  }

  // Batch fetch all users in a single query
  const userIdsArray = Array.from(userIds);
  const users =
    userIdsArray.length > 0
      ? await db.query.user.findMany({
          where: inArray(user.id, userIdsArray),
          columns: { id: true, name: true, image: true },
        })
      : [];

  // Create user map for O(1) lookups
  const userMap = new Map(users.map((u) => [u.id, u]));

  const getUser = (userId: string | null) => {
    if (!userId) return { id: "system", name: "Sistema", image: null };
    const u = userMap.get(userId);
    return u
      ? { id: u.id, name: u.name, image: u.image }
      : { id: userId, name: "Usuário", image: null };
  };

  const activities: Activity[] = [];

  // Process projects
  for (const project of allProjects) {
    if (project.createdAt) {
      activities.push({
        id: `project-create-${project.id}`,
        type: "project",
        action: "created",
        entityName: project.name,
        entityId: project.id,
        user: getUser(project.createdBy),
        timestamp: project.createdAt,
        metadata: {
          color: project.color || undefined,
          status: project.status || undefined,
        },
      });
    }

    if (project.updatedBy && project.updatedAt) {
      activities.push({
        id: `project-update-${project.id}-${project.updatedAt.getTime()}`,
        type: "project",
        action: "updated",
        entityName: project.name,
        entityId: project.id,
        user: getUser(project.updatedBy),
        timestamp: project.updatedAt,
        metadata: {
          color: project.color || undefined,
          status: project.status || undefined,
        },
      });
    }
  }

  // Process tasks
  for (const task of allTasks) {
    if (task.createdAt) {
      activities.push({
        id: `task-create-${task.id}`,
        type: "task",
        action: "created",
        entityName: task.name,
        entityId: task.id,
        user: getUser(task.createdBy),
        timestamp: task.createdAt,
        metadata: {
          projectName: task.sprint?.project?.name || undefined,
          sprintName: task.sprint?.name || undefined,
          tags: task.tags || undefined,
          status: task.status || undefined,
        },
      });
    }

    if (task.updatedBy && task.updatedAt) {
      activities.push({
        id: `task-update-${task.id}-${task.updatedAt.getTime()}`,
        type: "task",
        action: "updated",
        entityName: task.name,
        entityId: task.id,
        user: getUser(task.updatedBy),
        timestamp: task.updatedAt,
        metadata: {
          projectName: task.sprint?.project?.name || undefined,
          sprintName: task.sprint?.name || undefined,
          tags: task.tags || undefined,
          status: task.status || undefined,
        },
      });
    }
  }

  // Process sprints
  for (const sprint of allSprints) {
    if (sprint.createdAt) {
      activities.push({
        id: `sprint-create-${sprint.id}`,
        type: "sprint",
        action: "created",
        entityName: sprint.name,
        entityId: sprint.id,
        user: getUser(sprint.createdBy),
        timestamp: sprint.createdAt,
        metadata: {
          projectName: sprint.project?.name || undefined,
        },
      });
    }

    if (sprint.updatedBy && sprint.updatedAt) {
      activities.push({
        id: `sprint-update-${sprint.id}-${sprint.updatedAt.getTime()}`,
        type: "sprint",
        action: "updated",
        entityName: sprint.name,
        entityId: sprint.id,
        user: getUser(sprint.updatedBy),
        timestamp: sprint.updatedAt,
        metadata: {
          projectName: sprint.project?.name || undefined,
        },
      });
    }
  }

  // Process docs
  for (const doc of allDocs) {
    if (doc.createdAt) {
      activities.push({
        id: `doc-create-${doc.id}`,
        type: "doc",
        action: "created",
        entityName:
          doc.content.substring(0, 50) + (doc.content.length > 50 ? "..." : ""),
        entityId: doc.id,
        user: getUser(doc.createdBy),
        timestamp: doc.createdAt,
        metadata: {
          docType: doc.type || undefined,
        },
      });
    }

    if (doc.updatedBy && doc.updatedAt) {
      activities.push({
        id: `doc-update-${doc.id}-${doc.updatedAt.getTime()}`,
        type: "doc",
        action: "updated",
        entityName:
          doc.content.substring(0, 50) + (doc.content.length > 50 ? "..." : ""),
        entityId: doc.id,
        user: getUser(doc.updatedBy),
        timestamp: doc.updatedAt,
        metadata: {
          docType: doc.type || undefined,
        },
      });
    }
  }

  // Sort all activities by timestamp descending and limit
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return activities.slice(0, limit);
}
