import { seedDevTeams } from "./dev-teams";
import { seedTeamRoles } from "./teamRoles";
import { seedConcludedProjects } from "./concluded-projects";

async function runSeeders() {
  console.log("🚀 Starting database seeding...");

  try {
    // Seed dev teams first (required for projects)
    await seedDevTeams();

    // Seed team roles
    await seedTeamRoles();

    // Seed concluded projects with sprints
    await seedConcludedProjects();

    console.log("✨ All seeders completed successfully!");
  } catch (error) {
    console.error("💥 Seeding process failed:", error);
    process.exit(1);
  }
}

// Run all seeders
if (require.main === module) {
  runSeeders()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { runSeeders, seedDevTeams, seedConcludedProjects };
