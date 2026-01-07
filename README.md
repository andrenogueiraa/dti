# DTI - Project Management System

A comprehensive project management system built with Next.js for managing development teams, projects, sprints, and tasks. The system provides Kanban boards, calendar views, file management, and team collaboration features.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Key Concepts](#key-concepts)
- [Development](#development)
- [Deployment](#deployment)

## ✨ Features

### Core Functionality

- **Development Teams Management**: Create and manage development teams with user assignments and roles
- **Project Management**:
  - Track projects with statuses (Aguardando Início, Em andamento, Concluído, Suspenso, Cancelado)
  - Organize projects by development teams
  - Color-coded project visualization
  - Project complexity and impact tracking
- **Sprint Management**:
  - Create and manage sprints within projects
  - Sprint reviews and retrospectives
  - Progress tracking
  - Date management
- **Task Management**:
  - Task creation and assignment
  - Task status tracking (Não iniciada, Em progresso, Em revisão, Concluída)
  - Kanban board for task visualization
  - Task priorities and tags
- **File Management**:
  - Image uploads (JPEG, PNG, GIF, WebP)
  - PDF document management
  - File association with projects, sprints, tasks, and documents
  - Supabase Storage integration
- **Views**:
  - **Current Projects**: Active projects organized by development teams
  - **Past Projects**: Calendar view of concluded projects
  - **Future Projects**: Table view of planned projects
  - **Dashboard**: Kanban board view of all projects by status
- **Authentication**:
  - GitHub OAuth integration via Better Auth
  - User management with roles and permissions
  - Organization and team support
- **UI/UX**:
  - Dark mode support
  - Responsive design
  - Modern UI with shadcn/ui components
  - Drag-and-drop Kanban boards

## 🛠 Tech Stack

### Core Framework
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Turbopack** - Fast bundler

### Database & ORM
- **PostgreSQL** - Relational database
- **Drizzle ORM** - Type-safe SQL ORM
- **PostGIS** - Geographic data support (configured)

### Authentication
- **Better Auth** - Authentication library
  - GitHub OAuth provider
  - JWT support
  - Organization and team management
  - Admin features

### Storage
- **Supabase Storage** - File storage (S3-compatible)
- **AWS SDK** - S3 client for Supabase Storage

### UI Components & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **next-themes** - Theme management

### State Management & Data Fetching
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Additional Libraries
- **@dnd-kit** - Drag and drop functionality
- **Embla Carousel** - Image carousel
- **Sonner** - Toast notifications
- **Vercel Analytics** - Analytics

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ or **Bun** 1.3+
- **Docker** and **Docker Compose** (for local PostgreSQL)
- **Git**
- **GitHub OAuth App** (for authentication)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dti
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the required variables (see [Environment Variables](#environment-variables) section).

### 4. Set Up Database

See [Database Setup](#database-setup) for detailed instructions. Quick start:

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Push database schema
bun run push

# Seed database (optional)
bun run seed
```

### 5. Run Development Server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/dti_db` |

### Authentication (Better Auth)

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `your_github_client_id` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `your_github_client_secret` |
| `ADMIN_USER_ID` | User ID of the admin user | `user_id_from_github` |
| `NEXT_PUBLIC_APP_URL` | Public URL of the application (optional) | `http://localhost:3000` |

### Supabase Storage (S3-compatible)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | Supabase anonymous/public key | `your_anon_key` |
| `S3_BUCKET_NAME` | Storage bucket name | `your-bucket-name` |
| `S3_ENDPOINT` | S3 endpoint URL | `https://your-project-id.storage.supabase.co` |
| `S3_REGION` | S3 region | `us-east-1` |
| `ACCESS_KEY_ID` | S3 access key ID | `your_access_key` |
| `SECRET_ACCESS_KEY` | S3 secret access key | `your_secret_key` |

### Setting Up GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github` (development)
4. Copy the Client ID and Client Secret to your `.env.local`

## 🗄 Database Setup

This project uses PostgreSQL with Docker Compose for local development. For detailed setup instructions, see [README-Docker.md](README-Docker.md).

### Quick Setup

1. **Start PostgreSQL**:
   ```bash
   docker-compose up -d
   ```

2. **Push Database Schema**:
   ```bash
   bun run push
   ```
   This command uses Drizzle Kit to push the schema defined in `drizzle/core-schema.ts` and `drizzle/auth-schema.ts` to your database.

3. **Seed Database** (optional):
   ```bash
   bun run seed
   ```
   This will populate the database with sample data including development teams, roles, and concluded projects.

### Database Schema

The database schema is defined using Drizzle ORM in:
- `drizzle/core-schema.ts` - Core application schema (projects, sprints, tasks, teams, etc.)
- `drizzle/auth-schema.ts` - Authentication schema (users, sessions, accounts, etc.)

Key entities:
- **dev_teams**: Development teams
- **projects**: Projects with status, complexity, and impact metrics
- **sprints**: Sprints within projects
- **tasks**: Tasks within sprints
- **user_dev_teams**: User-team relationships with roles
- **images** & **pdfs**: File attachments
- **docs**: Documents (reviews, retrospectives)

## 📁 Project Structure

```
dti/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   │   ├── create/          # Account creation
│   │   ├── login/           # Login page
│   │   └── logout/          # Logout page
│   ├── api/                 # API routes
│   │   ├── auth/            # Better Auth endpoints
│   │   └── upload/          # File upload endpoints
│   ├── dashboard/            # Project dashboard (Kanban)
│   ├── dev-teams/           # Development teams management
│   ├── future-projects/     # Future projects view
│   ├── past-projects/       # Past projects calendar view
│   ├── projects/            # Project details and management
│   │   └── [projectId]/
│   │       ├── sprints/     # Sprint management
│   │       │   └── [sprintId]/
│   │       │       ├── tasks/    # Task management
│   │       │       └── review/   # Sprint reviews
│   │       └── images/      # Project images
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (current projects)
├── components/              # React components
│   ├── custom/              # Custom components
│   └── ui/                  # shadcn/ui components
├── drizzle/                 # Database schema and migrations
│   ├── core-schema.ts       # Core application schema
│   ├── auth-schema.ts       # Authentication schema
│   └── seeders/             # Database seeders
├── enums/                   # TypeScript enums
│   ├── colors.ts            # Project color options
│   ├── complexity-levels.ts # Project complexity levels
│   ├── project-statuses.ts  # Project status options
│   └── task-statuses.ts    # Task status options
├── hooks/                   # React hooks
├── lib/                     # Utility libraries
│   ├── auth.ts              # Better Auth configuration
│   ├── supabase/            # Supabase client setup
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## 🎯 Key Concepts

### Development Teams

Development teams are groups of users working together on projects. Each team can have:
- Multiple members with different roles
- Multiple projects
- Team image and description

### Projects

Projects represent work initiatives with the following attributes:
- **Status**:
  - `AI` - Aguardando Início (Awaiting Start)
  - `EA` - Em andamento (In Progress)
  - `CO` - Concluído (Completed)
  - `SU` - Suspenso (Suspended)
  - `CA` - Cancelado (Cancelled)
- **Color**: Visual color coding for easy identification
- **Complexity**: Very Low, Low, Medium, High, Very High
- **Impact Metrics**: Social impact and SEMARH impact scores
- **Estimated Duration**: Estimated weeks to complete
- **Dates**: Start and finish dates

### Sprints

Sprints are time-boxed iterations within projects:
- Associated with a project
- Have start and finish dates
- Track progress percentage
- Include review and retrospective documents
- Can contain multiple tasks

### Tasks

Tasks are work items within sprints:
- **Status**:
  - `NI` - Não iniciada (Not Started)
  - `EP` - Em progresso (In Progress)
  - `ER` - Em revisão (In Review)
  - `C` - Concluída (Completed)
- Can be assigned to users
- Support tags and priorities
- Can have associated images and PDFs

### Views

The application provides three main views:

1. **Current Projects** (`/`): Shows active projects organized by development teams
2. **Past Projects** (`/past-projects`): Calendar view of concluded projects
3. **Future Projects** (`/future-projects`): Table view of planned projects
4. **Dashboard** (`/dashboard`): Kanban board showing all projects organized by status

## 💻 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start development server with Turbopack |
| `bun build` | Build production bundle with Turbopack |
| `bun start` | Start production server |
| `bun lint` | Run ESLint |
| `bun push` | Push database schema changes to database |
| `bun seed` | Seed database with sample data |

### Development Workflow

1. **Database Changes**:
   - Modify schema in `drizzle/core-schema.ts` or `drizzle/auth-schema.ts`
   - Run `bun run push` to apply changes

2. **Adding Features**:
   - Create routes in `app/` directory
   - Use server actions for data mutations
   - Use React Server Components for data fetching

3. **Styling**:
   - Use Tailwind CSS classes
   - Add custom components in `components/custom/`
   - Use shadcn/ui components from `components/ui/`

### Code Style

- TypeScript strict mode enabled
- ESLint configured with Next.js rules
- React Server Components by default
- Server Actions for mutations

## 🚢 Deployment

### Build for Production

```bash
bun run build
```

### Environment Variables for Production

Ensure all environment variables are set in your production environment:
- Database connection string
- GitHub OAuth credentials
- Supabase Storage credentials
- Public app URL

### Database Migration

For production, use proper migration tools:
```bash
# Generate migrations
drizzle-kit generate

# Apply migrations
drizzle-kit migrate
```

### Recommended Platforms

- **Vercel** - Optimized for Next.js
- **Railway** - Easy PostgreSQL hosting
- **Supabase** - Database and storage hosting

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## 🔗 Related Documentation

- [README-Docker.md](README-Docker.md) - Docker and PostgreSQL setup guide

## 📝 License

[Add your license information here]

---

**Note**: This is a project management system designed for development teams. Make sure to configure all environment variables and set up authentication before deploying to production.
