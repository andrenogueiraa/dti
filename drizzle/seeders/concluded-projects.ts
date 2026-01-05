import { db } from "../index";
import { devTeams, projects, sprints, docs } from "../core-schema";
import { eq, and } from "drizzle-orm";

interface ProjectData {
  name: string;
  description: string;
  color: string;
  teamName: string;
  sprints: Array<{
    name: string;
    description: string;
    startDate: Date;
    finishDate: Date;
    progress: number;
  }>;
}

// Generate fake projects with sprints across different years
const projectsData: ProjectData[] = [
  {
    name: "Sistema de Gestão Ambiental",
    description: "Plataforma completa para gestão de processos ambientais",
    color: "blue",
    teamName: "Breno",
    sprints: [
      {
        name: "Sprint 1 - Setup Inicial",
        description: "Configuração do ambiente e arquitetura base",
        startDate: new Date(2023, 0, 2), // Jan 2, 2023
        finishDate: new Date(2023, 0, 15), // Jan 15, 2023
        progress: 100,
      },
      {
        name: "Sprint 2 - Autenticação",
        description: "Sistema de login e permissões",
        startDate: new Date(2023, 0, 16), // Jan 16, 2023
        finishDate: new Date(2023, 0, 29), // Jan 29, 2023
        progress: 100,
      },
      {
        name: "Sprint 3 - Dashboard",
        description: "Interface principal e métricas",
        startDate: new Date(2023, 1, 1), // Feb 1, 2023
        finishDate: new Date(2023, 1, 14), // Feb 14, 2023
        progress: 100,
      },
      {
        name: "Sprint 4 - Relatórios",
        description: "Geração de relatórios e exportação",
        startDate: new Date(2023, 1, 15), // Feb 15, 2023
        finishDate: new Date(2023, 2, 1), // Mar 1, 2023
        progress: 100,
      },
    ],
  },
  {
    name: "App de Monitoramento Florestal",
    description: "Aplicativo mobile para monitoramento de áreas florestais",
    color: "green",
    teamName: "Rubens",
    sprints: [
      {
        name: "Sprint 1 - MVP",
        description: "Versão mínima viável",
        startDate: new Date(2023, 2, 5), // Mar 5, 2023
        finishDate: new Date(2023, 2, 19), // Mar 19, 2023
        progress: 100,
      },
      {
        name: "Sprint 2 - Geolocalização",
        description: "Integração com GPS e mapas",
        startDate: new Date(2023, 2, 20), // Mar 20, 2023
        finishDate: new Date(2023, 3, 3), // Apr 3, 2023
        progress: 100,
      },
      {
        name: "Sprint 3 - Offline Mode",
        description: "Funcionalidade offline",
        startDate: new Date(2023, 3, 4), // Apr 4, 2023
        finishDate: new Date(2023, 3, 17), // Apr 17, 2023
        progress: 100,
      },
    ],
  },
  {
    name: "Portal de Licenciamento",
    description: "Sistema web para processos de licenciamento ambiental",
    color: "purple",
    teamName: "Gabriel",
    sprints: [
      {
        name: "Sprint 1 - Cadastro",
        description: "Módulo de cadastro de processos",
        startDate: new Date(2023, 4, 1), // May 1, 2023
        finishDate: new Date(2023, 4, 14), // May 14, 2023
        progress: 100,
      },
      {
        name: "Sprint 2 - Workflow",
        description: "Sistema de aprovações e fluxo",
        startDate: new Date(2023, 4, 15), // May 15, 2023
        finishDate: new Date(2023, 5, 1), // Jun 1, 2023
        progress: 100,
      },
      {
        name: "Sprint 3 - Notificações",
        description: "Sistema de alertas e notificações",
        startDate: new Date(2023, 5, 2), // Jun 2, 2023
        finishDate: new Date(2023, 5, 15), // Jun 15, 2023
        progress: 100,
      },
      {
        name: "Sprint 4 - Integração",
        description: "Integração com sistemas externos",
        startDate: new Date(2023, 5, 16), // Jun 16, 2023
        finishDate: new Date(2023, 6, 1), // Jul 1, 2023
        progress: 100,
      },
      {
        name: "Sprint 5 - Testes Finais",
        description: "Testes e ajustes finais",
        startDate: new Date(2023, 6, 2), // Jul 2, 2023
        finishDate: new Date(2023, 6, 15), // Jul 15, 2023
        progress: 100,
      },
    ],
  },
  {
    name: "Sistema de Fiscalização",
    description: "Plataforma para gestão de fiscalizações ambientais",
    color: "red",
    teamName: "Isaías",
    sprints: [
      {
        name: "Sprint 1 - Base",
        description: "Estrutura base do sistema",
        startDate: new Date(2023, 6, 20), // Jul 20, 2023
        finishDate: new Date(2023, 7, 2), // Aug 2, 2023
        progress: 100,
      },
      {
        name: "Sprint 2 - Autuações",
        description: "Módulo de autuações",
        startDate: new Date(2023, 7, 3), // Aug 3, 2023
        finishDate: new Date(2023, 7, 16), // Aug 16, 2023
        progress: 100,
      },
      {
        name: "Sprint 3 - Multas",
        description: "Gestão de multas e penalidades",
        startDate: new Date(2023, 7, 17), // Aug 17, 2023
        finishDate: new Date(2023, 8, 1), // Sep 1, 2023
        progress: 100,
      },
    ],
  },
  {
    name: "Gestão de Recursos Hídricos",
    description: "Sistema para monitoramento de recursos hídricos",
    color: "cyan",
    teamName: "Gerson",
    sprints: [
      {
        name: "Sprint 1 - Início",
        description: "Setup e planejamento",
        startDate: new Date(2023, 8, 5), // Sep 5, 2023
        finishDate: new Date(2023, 8, 18), // Sep 18, 2023
        progress: 100,
      },
      {
        name: "Sprint 2 - Sensores",
        description: "Integração com sensores IoT",
        startDate: new Date(2023, 8, 19), // Sep 19, 2023
        finishDate: new Date(2023, 9, 2), // Oct 2, 2023
        progress: 100,
      },
      {
        name: "Sprint 3 - Dashboard",
        description: "Visualização de dados",
        startDate: new Date(2023, 9, 3), // Oct 3, 2023
        finishDate: new Date(2023, 9, 16), // Oct 16, 2023
        progress: 100,
      },
      {
        name: "Sprint 4 - Alertas",
        description: "Sistema de alertas automáticos",
        startDate: new Date(2023, 9, 17), // Oct 17, 2023
        finishDate: new Date(2023, 10, 1), // Nov 1, 2023
        progress: 100,
      },
    ],
  },
  {
    name: "Portal Financeiro",
    description: "Sistema de gestão financeira e orçamentária",
    color: "emerald",
    teamName: "Gustavo",
    sprints: [
      {
        name: "Sprint 1 - Contas",
        description: "Gestão de contas e pagamentos",
        startDate: new Date(2023, 10, 5), // Nov 5, 2023
        finishDate: new Date(2023, 10, 18), // Nov 18, 2023
        progress: 100,
      },
      {
        name: "Sprint 2 - Orçamento",
        description: "Planejamento orçamentário",
        startDate: new Date(2023, 10, 19), // Nov 19, 2023
        finishDate: new Date(2023, 11, 2), // Dec 2, 2023
        progress: 100,
      },
      {
        name: "Sprint 3 - Relatórios",
        description: "Relatórios financeiros",
        startDate: new Date(2023, 11, 3), // Dec 3, 2023
        finishDate: new Date(2023, 11, 16), // Dec 16, 2023
        progress: 100,
      },
    ],
  },
  {
    name: "RH Digital",
    description: "Plataforma de gestão de pessoas",
    color: "pink",
    teamName: "Leonardo",
    sprints: [
      {
        name: "Sprint 1 - Funcionários",
        description: "Cadastro de funcionários",
        startDate: new Date(2024, 0, 2), // Jan 2, 2024
        finishDate: new Date(2024, 0, 15), // Jan 15, 2024
        progress: 100,
      },
      {
        name: "Sprint 2 - Férias",
        description: "Gestão de férias e ausências",
        startDate: new Date(2024, 0, 16), // Jan 16, 2024
        finishDate: new Date(2024, 0, 29), // Jan 29, 2024
        progress: 100,
      },
      {
        name: "Sprint 3 - Avaliações",
        description: "Sistema de avaliações de desempenho",
        startDate: new Date(2024, 1, 1), // Feb 1, 2024
        finishDate: new Date(2024, 1, 14), // Feb 14, 2024
        progress: 100,
      },
    ],
  },
  {
    name: "API Gateway",
    description: "Gateway centralizado para APIs",
    color: "indigo",
    teamName: "André",
    sprints: [
      {
        name: "Sprint 1 - Arquitetura",
        description: "Definição da arquitetura",
        startDate: new Date(2024, 1, 5), // Feb 5, 2024
        finishDate: new Date(2024, 1, 18), // Feb 18, 2024
        progress: 100,
      },
      {
        name: "Sprint 2 - Autenticação",
        description: "Sistema de autenticação OAuth",
        startDate: new Date(2024, 1, 19), // Feb 19, 2024
        finishDate: new Date(2024, 2, 4), // Mar 4, 2024
        progress: 100,
      },
      {
        name: "Sprint 3 - Rate Limiting",
        description: "Controle de taxa de requisições",
        startDate: new Date(2024, 2, 5), // Mar 5, 2024
        finishDate: new Date(2024, 2, 18), // Mar 18, 2024
        progress: 100,
      },
      {
        name: "Sprint 4 - Monitoramento",
        description: "Logs e monitoramento",
        startDate: new Date(2024, 2, 19), // Mar 19, 2024
        finishDate: new Date(2024, 3, 1), // Apr 1, 2024
        progress: 100,
      },
    ],
  },
  {
    name: "Dashboard Analytics",
    description: "Plataforma de analytics e business intelligence",
    color: "orange",
    teamName: "Bruno",
    sprints: [
      {
        name: "Sprint 1 - Data Collection",
        description: "Coleta e armazenamento de dados",
        startDate: new Date(2024, 3, 5), // Apr 5, 2024
        finishDate: new Date(2024, 3, 18), // Apr 18, 2024
        progress: 100,
      },
      {
        name: "Sprint 2 - Visualizações",
        description: "Gráficos e dashboards",
        startDate: new Date(2024, 3, 19), // Apr 19, 2024
        finishDate: new Date(2024, 4, 2), // May 2, 2024
        progress: 100,
      },
      {
        name: "Sprint 3 - Exportação",
        description: "Exportação de relatórios",
        startDate: new Date(2024, 4, 3), // May 3, 2024
        finishDate: new Date(2024, 4, 16), // May 16, 2024
        progress: 100,
      },
    ],
  },
  // Projects with overlapping sprints for testing
  {
    name: "Sistema de Backup",
    description: "Sistema automatizado de backup e restore",
    color: "amber",
    teamName: "Breno",
    sprints: [
      {
        name: "Sprint 1 - Core",
        description: "Funcionalidade principal",
        startDate: new Date(2024, 5, 1), // Jun 1, 2024
        finishDate: new Date(2024, 5, 21), // Jun 21, 2024
        progress: 100,
      },
      {
        name: "Sprint 2 - Otimização",
        description: "Otimização de performance",
        startDate: new Date(2024, 5, 15), // Jun 15, 2024 (overlaps)
        finishDate: new Date(2024, 6, 5), // Jul 5, 2024
        progress: 100,
      },
      {
        name: "Sprint 3 - Testes",
        description: "Testes e validação",
        startDate: new Date(2024, 6, 1), // Jul 1, 2024 (overlaps)
        finishDate: new Date(2024, 6, 14), // Jul 14, 2024
        progress: 100,
      },
    ],
  },
];

export async function seedConcludedProjects() {
  console.log("🌱 Seeding concluded projects with sprints...");

  try {
    // Get all dev teams
    const allTeams = await db.select().from(devTeams);

    if (allTeams.length === 0) {
      console.warn("⚠️  No dev teams found. Please run dev-teams seeder first.");
      return;
    }

    // Create a map of team names to IDs
    const teamMap = new Map(
      allTeams.map((team) => [team.name, team.id])
    );

    let projectsCreated = 0;
    let sprintsCreated = 0;

    for (const projectData of projectsData) {
      const teamId = teamMap.get(projectData.teamName);

      if (!teamId) {
        console.warn(
          `⚠️  Team "${projectData.teamName}" not found. Skipping project "${projectData.name}"`
        );
        continue;
      }

      // Check if project already exists
      const existingProject = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.name, projectData.name))
        .limit(1)
        .then((rows) => rows[0] || null);

      let projectId: string;

      if (existingProject) {
        // Update existing project to concluded status
        await db
          .update(projects)
          .set({
            status: "CO",
            color: projectData.color,
            responsibleTeamId: teamId,
            updatedAt: new Date(),
          })
          .where(eq(projects.id, existingProject.id));

        projectId = existingProject.id;
        console.log(`✅ Updated project: ${projectData.name}`);
      } else {
        // Create new project
        const [newProject] = await db
          .insert(projects)
          .values({
            name: projectData.name,
            description: projectData.description,
            color: projectData.color,
            status: "CO",
            responsibleTeamId: teamId,
            startDate: projectData.sprints[0]?.startDate || null,
            finishDate:
              projectData.sprints[projectData.sprints.length - 1]?.finishDate ||
              null,
          })
          .returning({ id: projects.id });

        projectId = newProject.id;
        projectsCreated++;
        console.log(`✅ Created project: ${projectData.name}`);
      }

      // Create sprints for this project
      for (const sprintData of projectData.sprints) {
        // Check if sprint already exists
        const existingSprint = await db
          .select({ id: sprints.id })
          .from(sprints)
          .where(and(eq(sprints.projectId, projectId), eq(sprints.name, sprintData.name)))
          .limit(1)
          .then((rows: Array<{ id: string }>) => rows[0] || null);

        if (existingSprint) {
          console.log(
            `  ⏭️  Sprint "${sprintData.name}" already exists, skipping...`
          );
          continue;
        }

        // Create doc review for sprint (required)
        const [docReview] = await db
          .insert(docs)
          .values({
            type: "SREV",
            date: sprintData.finishDate,
            content: `## Tópicos abordados\n- ${sprintData.description}\n\n## Metas alcançadas\n- Meta 1\n- Meta 2\n\n## Participantes\n- Membro 1\n- Membro 2`,
            finishedAt: sprintData.finishDate,
          })
          .returning({ id: docs.id });

        // Create sprint
        await db.insert(sprints).values({
          name: sprintData.name,
          description: sprintData.description,
          startDate: sprintData.startDate,
          finishDate: sprintData.finishDate,
          progress: sprintData.progress,
          projectId: projectId,
          docReviewId: docReview.id,
        });

        sprintsCreated++;
        console.log(`  ✅ Created sprint: ${sprintData.name}`);
      }
    }

    console.log(
      `🎉 Concluded projects seeding completed! Created ${projectsCreated} projects and ${sprintsCreated} sprints.`
    );
  } catch (error) {
    console.error("❌ Error seeding concluded projects:", error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedConcludedProjects()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

