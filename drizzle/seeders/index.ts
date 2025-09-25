import { seedDevTeams } from "./dev-teams";
import { seedProjects } from "./projects";
import { seedSprints } from "./sprints";

async function runSeeders() {
  console.log("🚀 Starting database seeding...");

  try {
    // Seed dev teams first (required for projects)
    await seedDevTeams();

    // Then seed projects (depends on dev teams)
    await seedProjects();

    // Finally seed sprints (depends on projects)
    await seedSprints();

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

export { runSeeders, seedDevTeams, seedProjects, seedSprints };
