import { db } from "../index";
import { roles } from "../core-schema";
import { eq } from "drizzle-orm";

const teamRolesData = [
  {
    name: "Líder",
    description: "Líder do time",
  },
  {
    name: "Membro",
    description: "Membro do time",
  },
];

export async function seedTeamRoles() {
  console.log("🌱 Seeding team roles...");

  for (const teamRoleData of teamRolesData) {
    try {
      // Check if team already exists
      const existingRole = await db
        .select({
          id: roles.id,
          name: roles.name,
        })
        .from(roles)
        .where(eq(roles.name, teamRoleData.name))
        .limit(1)
        .then((rows) => rows[0] || null);

      if (existingRole) {
        // Update existing team
        await db
          .update(roles)
          .set({
            description: teamRoleData.description,
            updatedAt: new Date(),
          })
          .where(eq(roles.id, existingRole.id));

        console.log(`✅ Updated role: ${teamRoleData.name}`);
      } else {
        // Insert new team
        await db.insert(roles).values({
          name: teamRoleData.name,
          description: teamRoleData.description,
        });

        console.log(`✅ Created role: ${teamRoleData.name}`);
      }
    } catch (error) {
      console.error(`❌ Error seeding role ${teamRoleData.name}:`, error);
    }
  }

  console.log("🎉 Team roles seeding completed!");
}

// Run seeder if called directly
if (require.main === module) {
  seedTeamRoles()
    .then(() => process.exit(0))
    .catch((error: Error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
