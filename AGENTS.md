# DTI - Project Management System

This is a Next.js 16 project management application with TypeScript, Drizzle ORM, PostgreSQL, Better Auth, and Supabase Storage for managing development teams, projects, sprints, and tasks.

## Tech Stack

- **Next.js 16** with React 19 and App Router
- **TypeScript** with strict mode
- **Drizzle ORM** with PostgreSQL
- **Better Auth** for GitHub OAuth authentication
- **Supabase Storage** (S3-compatible) for file management
- **shadcn/ui** + Radix UI components
- **Tailwind CSS 4** for styling
- **TanStack Query** for data fetching and caching
- **React Hook Form** + Zod for form validation
- **@dnd-kit** for drag-and-drop functionality

## Project Structure

```
app/                      # Next.js App Router
  (auth)/                 # Authentication routes (login, create, logout)
  api/                    # API routes
    auth/[...all]/        # Better Auth endpoints
    upload/               # File upload endpoints
  dashboard/              # Project dashboard (Kanban view)
  dev-teams/              # Development teams management
  feed/                   # Activity feed
  future-projects/        # Future projects table view
  past-projects/          # Past projects calendar view
  projects/               # Project details and management
    [projectId]/
      sprints/[sprintId]/  # Sprint and task management
      images/             # Project images
  layout.tsx              # Root layout
  page.tsx                # Home page (current projects)

components/
  custom/                 # Custom project-specific components
  ui/                     # shadcn/ui components
  dropzone.tsx            # File upload dropzone component

drizzle/
  index.ts                # Drizzle database client export
  core-schema.ts          # Core application schema (projects, sprints, tasks, teams)
  auth-schema.ts          # Better Auth schema (users, sessions, accounts)
  seeders/                # Database seeders

enums/                    # TypeScript enums
  colors.ts               # Project color options
  complexity-levels.ts    # Project complexity levels
  project-statuses.ts     # Project status options
  task-statuses.ts        # Task status options

hooks/                    # React hooks

lib/
  auth.ts                 # Better Auth configuration
  supabase/               # Supabase client setup
  utils.ts                # Utility functions

scripts/                  # Database backup/restore scripts
```

## Code Conventions

### Server Actions Pattern

All data mutations and queries are done through Server Actions. Follow this pattern:

```typescript
"use server";

import { db } from "@/drizzle";

export async function getData() {
  return await db.query.projects.findMany({
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    columns: {
      id: true,
      name: true,
      // Only select needed columns
    },
    with: {
      responsibleTeam: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });
}
```

### Database Queries

- Import db from `@/drizzle`
- Use Drizzle query builder for type-safe queries
- Always specify `columns` to select only needed fields
- Use `with` for relations
- Order by appropriate fields for consistency
- Server actions must start with `"use server"` directive

### Component Organization

- **Server Components** by default for data fetching
- Use `"use client"` directive for interactive components
- Custom components go in `components/custom/`
- Use shadcn/ui components from `components/ui/`

### File Naming

- Server actions: `server-actions.ts` (in feature directories)
- Client components: `client.tsx` (in feature directories)
- Pages: `page.tsx`
- Layouts: `layout.tsx`
- Loading states: `loading.tsx`

### Styling Conventions

- Use Tailwind CSS classes for styling
- Use `cn()` utility (from `@/lib/utils`) for conditional class merging
- Follow existing color patterns using enums
- Use shadcn/ui components when available
- Use `lucide-react` for icons

### Forms

- Use React Hook Form with Zod validation
- Use `@hookform/resolvers/zod` for schema validation
- Import schemas from appropriate locations or define locally
- Use shadcn/ui form components (`components/ui/field.tsx`, etc.)

### File Uploads

- Use `components/dropzone.tsx` for file upload UI
- Upload to Supabase Storage using `@aws-sdk/client-s3`
- Store file metadata in `images` or `pdfs` tables
- Supported formats: JPEG, PNG, GIF, WebP (images), PDF (documents)

### Authentication

- User authentication via Better Auth with GitHub OAuth
- Configuration in `lib/auth.ts`
- Use `auth()` helper from `lib/auth.ts` to get session data
- API route at `/api/auth/[...all]/route.ts` handles auth callbacks

## Database Schema

Key tables (defined in `drizzle/core-schema.ts`):

- `dev_teams` - Development teams
- `projects` - Projects with status, complexity, impact metrics
- `sprints` - Time-boxed iterations within projects
- `tasks` - Work items within sprints
- `user_dev_teams` - User-team relationships with roles
- `images` & `pdfs` - File attachments
- `docs` - Documents (reviews, retrospectives)

Auth tables (defined in `drizzle/auth-schema.ts`):

- `user` - User accounts
- `session` - User sessions
- `account` - OAuth accounts

## Status Values

### Project Statuses (from `enums/project-statuses.ts`)

- `AI` - Aguardando Início (Awaiting Start)
- `EA` - Em andamento (In Progress)
- `CO` - Concluído (Completed)
- `SU` - Suspenso (Suspended)
- `CA` - Cancelado (Cancelled)

### Task Statuses (from `enums/task-statuses.ts`)

- `NI` - Não iniciada (Not Started)
- `EP` - Em progresso (In Progress)
- `ER` - Em revisão (In Review)
- `C` - Concluída (Completed)

### Project Colors

Use values from `enums/colors.ts` for consistent color coding.

### Complexity Levels

Use values from `enums/complexity-levels.ts` for project complexity.

## Available Scripts

| Script                         | Description                             |
| ------------------------------ | --------------------------------------- |
| `bun dev` or `npm run dev`     | Start development server with Turbopack |
| `bun build` or `npm run build` | Build production bundle with Turbopack  |
| `bun start`                    | Start production server                 |
| `bun lint`                     | Run ESLint                              |
| `bun push`                     | Push database schema changes (Drizzle)  |
| `bun seed`                     | Seed database with sample data          |
| `bun run db:backup`            | Backup local database                   |
| `bun run db:backup:prod`       | Backup production database              |
| `bun run db:restore`           | Restore database from backup            |

## Path Aliases

- `@/*` - Project root (configured in `tsconfig.json`)

## Linting and Type Checking

Always run `npm run lint` before committing changes. ESLint is configured with Next.js rules and strict TypeScript checking is enabled.

## Key Patterns

### Fetching Data in Components

```typescript
import { getAllProjects } from "./server-actions";

export default function Page() {
  const data = await getAllProjects();
  // Render data
}
```

### Using TanStack Query (Client Components)

```typescript
"use client";
import { useQuery } from "@tanstack/react-query";
import { getProjectData } from "./server-actions";

export function ProjectComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjectData,
  });
  // Render data
}
```

### Form Validation with Zod

```typescript
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["AI", "EA", "CO", "SU", "CA"]),
});
```

## Development Workflow

1. **Database Changes**: Modify schema in `drizzle/core-schema.ts` or `drizzle/auth-schema.ts`, then run `bun run push`
2. **Adding Features**: Create routes in `app/` directory, use server actions for queries and mutations
3. **Styling**: Use Tailwind CSS, add custom components in `components/custom/`, reuse shadcn/ui components
4. **Testing**: Verify changes work correctly with `bun tsc` and then `bun dev`

## Important Notes

- This is a Brazilian Portuguese application (UI labels are in Portuguese)
- Project statuses and task statuses use 2-letter codes
- Always use the db client from `@/drizzle` for database operations
- Environment variables are required for database, auth, and storage
- PostgreSQL runs via Docker Compose for local development (see `docker-compose.yml`)
