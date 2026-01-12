import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { user } from "./auth-schema";
import { TASK_STATUS_VALUES } from "@/enums/task-statuses";
import { PROJECT_STATUS_VALUES } from "@/enums/project-statuses";
import { DOC_TYPE_VALUES } from "@/enums/doc-types";
import { COLOR_VALUES } from "@/enums/colors";

export const taskStatusEnum = pgEnum(
  "task_status",
  TASK_STATUS_VALUES as [string, ...string[]]
);

export const projectStatusEnum = pgEnum(
  "project_status",
  PROJECT_STATUS_VALUES as [string, ...string[]]
);

export const docTypeEnum = pgEnum(
  "doc_type",
  DOC_TYPE_VALUES as [string, ...string[]]
);

export const colorEnum = pgEnum("color", COLOR_VALUES as [string, ...string[]]);

const baseColumns = {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: varchar({ length: 255 }),
  description: varchar({ length: 1000 }),
};

const auditColumns = {
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
  deletedAt: timestamp({ withTimezone: true }),
  createdBy: text().references(() => user.id, { onDelete: "cascade" }),
  updatedBy: text().references(() => user.id, { onDelete: "cascade" }),
  deletedBy: text().references(() => user.id, { onDelete: "cascade" }),
};

const statusColumns = {
  isActive: boolean().default(true),
  isDeleted: boolean().default(false),
};

const dateColumns = {
  startDate: date({ mode: "date" }),
  finishDate: date({ mode: "date" }),
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
  images: many(images),
}));

export const projects = pgTable("projects", {
  ...baseColumns,
  ...auditColumns,
  ...statusColumns,
  ...dateColumns,
  color: colorEnum("color").notNull().default("gray"),
  status: projectStatusEnum("status").notNull().default("AI"),
  responsibleTeamId: uuid().references(() => devTeams.id, {
    onDelete: "restrict",
  }),
  complexity: varchar({ length: 20 }),
  socialImpact: integer(),
  semarhImpact: integer(),
  estimatedWeeks: integer(),
  docOpeningId: uuid().references(() => docs.id, {
    onDelete: "restrict",
  }),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  responsibleTeam: one(devTeams, {
    fields: [projects.responsibleTeamId],
    references: [devTeams.id],
  }),
  docOpening: one(docs, {
    fields: [projects.docOpeningId],
    references: [docs.id],
  }),
  sprints: many(sprints),
  images: many(images),
  pdfs: many(pdfs),
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
  docReviewId: uuid()
    .notNull()
    .references(() => docs.id, {
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
  docReview: one(docs, {
    fields: [sprints.docReviewId],
    references: [docs.id],
  }),
  docRetrospective: one(docs, {
    fields: [sprints.docRetrospectiveId],
    references: [docs.id],
  }),

  tasks: many(tasks),
  images: many(images),
  pdfs: many(pdfs),
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

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  sprint: one(sprints, {
    fields: [tasks.sprintId],
    references: [sprints.id],
  }),
  responsibleUser: one(user, {
    fields: [tasks.responsibleUserId],
    references: [user.id],
  }),
  images: many(images),
  pdfs: many(pdfs),
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
  ...statusColumns,
  ...auditColumns,
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
  ...auditColumns,
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
  ...auditColumns,
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
  type: docTypeEnum("type").notNull(),
  finishedAt: timestamp(),
  ...auditColumns,
});

export const docsRelations = relations(docs, ({ many }) => ({
  images: many(images),
  pdfs: many(pdfs),
}));

const fileColumns = {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  description: text(),
  originalName: text().notNull(),
  name: varchar({ length: 255 }),
  path: text().notNull(),
  type: varchar({ length: 255 }).notNull(),
  size: integer().notNull(),
  url: text(),
};

export const images = pgTable("images", {
  ...fileColumns,

  width: integer(),
  height: integer(),

  projectId: uuid().references(() => projects.id, { onDelete: "cascade" }),
  sprintId: uuid().references(() => sprints.id, { onDelete: "cascade" }),
  docId: uuid().references(() => docs.id, { onDelete: "cascade" }),
  taskId: uuid().references(() => tasks.id, { onDelete: "cascade" }),

  ...auditColumns,
});

export const imagesRelations = relations(images, ({ one }) => ({
  doc: one(docs, {
    fields: [images.docId],
    references: [docs.id],
  }),
  task: one(tasks, {
    fields: [images.taskId],
    references: [tasks.id],
  }),
  project: one(projects, {
    fields: [images.projectId],
    references: [projects.id],
  }),
  sprint: one(sprints, {
    fields: [images.sprintId],
    references: [sprints.id],
  }),
}));

export const pdfs = pgTable("pdfs", {
  ...fileColumns,

  pages: integer().notNull(),

  projectId: uuid().references(() => projects.id, { onDelete: "cascade" }),
  sprintId: uuid().references(() => sprints.id, { onDelete: "cascade" }),
  docId: uuid().references(() => docs.id, { onDelete: "cascade" }),
  taskId: uuid().references(() => tasks.id, { onDelete: "cascade" }),

  ...auditColumns,
});

export const pdfsRelations = relations(pdfs, ({ one }) => ({
  project: one(projects, {
    fields: [pdfs.projectId],
    references: [projects.id],
  }),
  sprint: one(sprints, {
    fields: [pdfs.sprintId],
    references: [sprints.id],
  }),
  doc: one(docs, {
    fields: [pdfs.docId],
    references: [docs.id],
  }),
  task: one(tasks, {
    fields: [pdfs.taskId],
    references: [tasks.id],
  }),
}));
