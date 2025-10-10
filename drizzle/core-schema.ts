import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { user } from "./auth-schema";
import { TASK_STATUS_VALUES } from "@/shared-data/task-statuses";

export const taskStatusEnum = pgEnum(
  "task_status",
  TASK_STATUS_VALUES as [string, ...string[]]
);

const baseColumns = {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: varchar({ length: 255 }),
  description: varchar({ length: 1000 }),
};

const auditColumns = {
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
  deletedAt: timestamp(),
  createdBy: integer(),
  updatedBy: integer(),
  deletedBy: integer(),
};

const statusColumns = {
  isActive: boolean().default(true),
  isDeleted: boolean().default(false),
};

const dateColumns = {
  startDate: timestamp(),
  finishDate: timestamp(),
};

export const devTeams = pgTable("dev_teams", {
  ...baseColumns,
  ...auditColumns,
  ...statusColumns,
  imageUrl: text(),
});

export const devTeamsRelations = relations(devTeams, ({ many }) => ({
  userDevTeams: many(userDevTeams),
  projects: many(projects),
}));

export const projects = pgTable("projects", {
  ...baseColumns,
  ...auditColumns,
  ...statusColumns,
  ...dateColumns,
  color: text(),
  responsibleTeamId: uuid().references(() => devTeams.id, {
    onDelete: "restrict",
  }),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  responsibleTeam: one(devTeams, {
    fields: [projects.responsibleTeamId],
    references: [devTeams.id],
  }),
  sprints: many(sprints),
}));

export const sprints = pgTable("sprints", {
  ...baseColumns,
  ...auditColumns,
  ...statusColumns,
  ...dateColumns,
  progress: integer(),
  docRetrospectiveId: uuid().references(() => docs.id, {
    onDelete: "restrict",
  }),
  docReviewId: uuid().references(() => docs.id, {
    onDelete: "restrict",
  }),
  projectId: uuid()
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
});

export const sprintsRelations = relations(sprints, ({ one, many }) => ({
  project: one(projects, {
    fields: [sprints.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
}));

export const tasks = pgTable("tasks", {
  ...baseColumns,
  ...auditColumns,
  ...statusColumns,
  urgency: varchar({ length: 255 }),
  order: integer(),
  tags: text().array(),
  status: taskStatusEnum("status").notNull().default("NI"),
  sprintId: uuid()
    .notNull()
    .references(() => sprints.id, { onDelete: "cascade" }),
  responsibleUserId: text().references(() => user.id, { onDelete: "cascade" }),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  sprint: one(sprints, {
    fields: [tasks.sprintId],
    references: [sprints.id],
  }),
  responsibleUser: one(user, {
    fields: [tasks.responsibleUserId],
    references: [user.id],
  }),
}));

export const roles = pgTable("roles", {
  ...baseColumns,
  ...auditColumns,
  ...statusColumns,
});

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userDevTeams: many(userDevTeams),
}));

export const permissions = pgTable("permissions", {
  ...baseColumns,
  ...auditColumns,
  ...statusColumns,
});

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissions = pgTable("role_permissions", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  roleId: uuid()
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  permissionId: uuid()
    .notNull()
    .references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: timestamp().defaultNow(),
  createdBy: integer(),
});

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
);

export const userDevTeams = pgTable("user_dev_teams", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  devTeamId: uuid()
    .notNull()
    .references(() => devTeams.id, { onDelete: "cascade" }),
  roleId: uuid()
    .notNull()
    .references(() => roles.id, { onDelete: "restrict" }),
  joinedAt: timestamp().defaultNow(),
  leftAt: timestamp(),
});

export const userDevTeamsRelations = relations(userDevTeams, ({ one }) => ({
  user: one(user, {
    fields: [userDevTeams.userId],
    references: [user.id],
  }),
  devTeam: one(devTeams, {
    fields: [userDevTeams.devTeamId],
    references: [devTeams.id],
  }),
  role: one(roles, {
    fields: [userDevTeams.roleId],
    references: [roles.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  userDevTeams: many(userDevTeams),
}));

export const docs = pgTable("docs", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  content: text().notNull(),
  date: timestamp().notNull(),
  typeId: uuid()
    .notNull()
    .references(() => docTypes.id, { onDelete: "restrict" }),
  ...auditColumns,
});

export const docsRelations = relations(docs, ({ one }) => ({
  type: one(docTypes, {
    fields: [docs.typeId],
    references: [docTypes.id],
  }),
}));

export const docTypes = pgTable("doc_types", {
  ...baseColumns,
});

export const docTypesRelations = relations(docTypes, ({ many }) => ({
  docs: many(docs),
}));

// Relations
