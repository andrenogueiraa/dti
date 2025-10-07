import { db } from "../index";
import { projects, devTeams } from "../core-schema";
import { eq } from "drizzle-orm";

const projectsData = [
  {
    name: "AQC - Autorização de Queima Controlada Automatizada",
    description: "Procedimento SIGA para autorização de queima controlada",
    responsibleTeamName: "Rubens", // Florestal team
    startDate: new Date("2025-01-01"),
    finishDate: new Date("2025-03-31"),
    color: "bg-green-100",
  },
  {
    name: "Corte de Árvores Isoladas",
    description: "Procedimento SIGA para corte de árvores isoladas",
    responsibleTeamName: "Rubens", // Florestal team
    startDate: new Date("2025-02-01"),
    finishDate: new Date("2025-04-30"),
    color: "bg-blue-100",
  },
  {
    name: "AdotaPET",
    description: "Sistema de adoção de animais",
    responsibleTeamName: "Breno", // Biodiversidade team
    startDate: new Date("2025-01-15"),
    finishDate: new Date("2025-06-15"),
    color: "bg-yellow-100",
  },
  {
    name: "Módulos de Denúncias",
    description: "Procedimento SIGA para módulos de denúncias",
    responsibleTeamName: "Isaías", // Fiscalização team
    startDate: new Date("2025-03-01"),
    finishDate: new Date("2025-07-31"),
    color: "bg-red-100",
  },
];

export async function seedProjects() {
  console.log("🌱 Seeding projects...");

  // First, get all dev teams to map names to IDs
  const teams = await db
    .select({
      id: devTeams.id,
      name: devTeams.name,
    })
    .from(devTeams);
  const teamMap = new Map(teams.map((team) => [team.name, team.id]));

  for (const projectData of projectsData) {
    try {
      const responsibleTeamId = teamMap.get(projectData.responsibleTeamName);

      if (!responsibleTeamId) {
        console.error(
          `❌ Responsible team "${projectData.responsibleTeamName}" not found for project: ${projectData.name}`
        );
        continue;
      }

      // Check if project already exists
      const existingProject = await db
        .select({
          id: projects.id,
          name: projects.name,
        })
        .from(projects)
        .where(eq(projects.name, projectData.name))
        .limit(1)
        .then((rows) => rows[0] || null);

      const projectValues = {
        name: projectData.name,
        description: projectData.description,
        responsibleTeamId,
        startDate: projectData.startDate,
        finishDate: projectData.finishDate,
        color: projectData.color,
      };

      if (existingProject) {
        // Update existing project
        await db
          .update(projects)
          .set({
            ...projectValues,
            updatedAt: new Date(),
          })
          .where(eq(projects.id, existingProject.id));

        console.log(
          `✅ Updated project: ${projectData.name} (Team: ${projectData.responsibleTeamName})`
        );
      } else {
        // Insert new project
        await db.insert(projects).values(projectValues);

        console.log(
          `✅ Created project: ${projectData.name} (Team: ${projectData.responsibleTeamName})`
        );
      }
    } catch (error) {
      console.error(`❌ Error seeding project ${projectData.name}:`, error);
    }
  }

  console.log("🎉 Projects seeding completed!");
}

// Run seeder if called directly
if (require.main === module) {
  seedProjects()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
