import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { user } from "./auth-schema";

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

export const sprints = pgTable("sprints", {
  ...baseColumns,
  ...auditColumns,
  ...statusColumns,
  ...dateColumns,
  progress: integer(),
  projectId: uuid()
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
});

export const tasks = pgTable("tasks", {
  ...baseColumns,
  ...auditColumns,
  ...statusColumns,
  ...dateColumns,
});

export const roles = pgTable("roles", {
  ...baseColumns,
  ...auditColumns,
  ...statusColumns,
});

export const permissions = pgTable("permissions", {
  ...baseColumns,
  ...auditColumns,
  ...statusColumns,
});

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

// Relations
export const userRelations = relations(user, ({ many }) => ({
  userDevTeams: many(userDevTeams),
}));

export const devTeamsRelations = relations(devTeams, ({ many }) => ({
  userDevTeams: many(userDevTeams),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  responsibleTeam: one(devTeams, {
    fields: [projects.responsibleTeamId],
    references: [devTeams.id],
  }),
  sprints: many(sprints),
}));

export const sprintsRelations = relations(sprints, ({ one }) => ({
  project: one(projects, {
    fields: [sprints.projectId],
    references: [projects.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userDevTeams: many(userDevTeams),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

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
