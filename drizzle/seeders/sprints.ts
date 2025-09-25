import { db } from "../index";
import { sprints } from "../core-schema";
import { eq } from "drizzle-orm";

const sprintsData = [
  // AQC - Autorização de Queima Controlada Automatizada sprints
  {
    name: "Sprint 1",
    description: "Initial setup and requirements gathering",
    projectName: "AQC - Autorização de Queima Controlada Automatizada",
    startDate: new Date("2025-01-01"),
    finishDate: new Date("2025-01-15"),
  },
  {
    name: "Sprint 2",
    description: "Core development phase",
    projectName: "AQC - Autorização de Queima Controlada Automatizada",
    startDate: new Date("2025-01-16"),
    finishDate: new Date("2025-01-31"),
  },
  {
    name: "Sprint 3",
    description: "Testing and refinement",
    projectName: "AQC - Autorização de Queima Controlada Automatizada",
    startDate: new Date("2025-02-01"),
    finishDate: new Date("2025-02-15"),
  },
  // AdotaPET sprints
  {
    name: "Sprint 1",
    description: "Platform foundation and animal registration",
    projectName: "AdotaPET",
    startDate: new Date("2025-01-15"),
    finishDate: new Date("2025-02-01"),
  },
  {
    name: "Sprint 2",
    description: "Adoption matching system",
    projectName: "AdotaPET",
    startDate: new Date("2025-02-02"),
    finishDate: new Date("2025-02-19"),
  },
  // Módulos de Denúncias sprints
  {
    name: "Sprint 1",
    description: "Anonymous reporting system",
    projectName: "Módulos de Denúncias",
    startDate: new Date("2025-03-01"),
    finishDate: new Date("2025-03-18"),
  },
  {
    name: "Sprint 2",
    description: "Investigation workflow",
    projectName: "Módulos de Denúncias",
    startDate: new Date("2025-03-19"),
    finishDate: new Date("2025-04-05"),
  },
];

export async function seedSprints() {
  console.log("🌱 Seeding sprints...");

  // First, get all projects to map names to IDs
  const projects = await db.query.projects.findMany();
  const projectMap = new Map(
    projects.map((project) => [project.name, project.id])
  );

  for (const sprintData of sprintsData) {
    try {
      const projectId = projectMap.get(sprintData.projectName);

      if (!projectId) {
        console.error(
          `❌ Project "${sprintData.projectName}" not found for sprint: ${sprintData.name}`
        );
        continue;
      }

      // Check if sprint already exists (by name and project)
      const existingSprint = await db.query.sprints.findFirst({
        where: (sprints, { and, eq }) =>
          and(
            eq(sprints.name, sprintData.name),
            eq(sprints.projectId, projectId)
          ),
      });

      const sprintValues = {
        name: sprintData.name,
        description: sprintData.description,
        projectId,
        startDate: sprintData.startDate,
        finishDate: sprintData.finishDate,
      };

      if (existingSprint) {
        // Update existing sprint
        await db
          .update(sprints)
          .set({
            ...sprintValues,
            updatedAt: new Date(),
          })
          .where(eq(sprints.id, existingSprint.id));

        console.log(
          `✅ Updated sprint: ${sprintData.name} (Project: ${sprintData.projectName})`
        );
      } else {
        // Insert new sprint
        await db.insert(sprints).values(sprintValues);

        console.log(
          `✅ Created sprint: ${sprintData.name} (Project: ${sprintData.projectName})`
        );
      }
    } catch (error) {
      console.error(`❌ Error seeding sprint ${sprintData.name}:`, error);
    }
  }

  console.log("🎉 Sprints seeding completed!");
}

// Run seeder if called directly
if (require.main === module) {
  seedSprints()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
