import { db } from "../index";
import { devTeams } from "../core-schema";
import { eq } from "drizzle-orm";

const devTeamsData = [
  {
    name: "Breno",
    description: "Biodiversidade",
    imageUrl:
      "https://media.licdn.com/dms/image/v2/D4D03AQEqlmR2UWDZEw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1725931294109?e=1761782400&v=beta&t=krGxuW_k2uFJA5fZkWEG2BuMS24DOEducWz0KA55FNI",
  },
  {
    name: "Rubens",
    description: "Florestal",
    imageUrl:
      "https://media.licdn.com/dms/image/v2/C4D03AQEJ6uw1lHR5wQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1579229541634?e=1761782400&v=beta&t=Dpe5OMxTPE_A6p1MisGL70lOSWtBKEqh6qJhhOdXeM0",
  },
  {
    name: "Gabriel",
    description: "Licenciamento",
    imageUrl:
      "https://media.licdn.com/dms/image/v2/D4D03AQEACh34MLQdwQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1708126618251?e=1761782400&v=beta&t=ndhYrt0vFvEZ-yaaY9MJZmqZkqVES0QYpcSbuIdKvtw",
  },
  {
    name: "Isaías",
    description: "Fiscalização",
    imageUrl:
      "https://media.licdn.com/dms/image/v2/D4E03AQFe5M60-Zm2Nw/profile-displayphoto-crop_800_800/B4EZjUXF_8GoAI-/0/1755909481718?e=1761782400&v=beta&t=9uqbdupAO6bZTGr-zKHQ8exF7pVZP3lTaaGe-gIU_7o",
  },
  {
    name: "Gerson",
    description: "Recursos Hídricos",
    imageUrl:
      "https://media.licdn.com/dms/image/v2/D4D03AQFRWOyZ_qbQtA/profile-displayphoto-crop_800_800/B4DZi9Wh7lGQAI-/0/1755523459320?e=1761782400&v=beta&t=Vg8OMNjVbCkruf4b9_i6HsB2MAeJsMEU6kNyBDXlbJ8",
  },
  {
    name: "Gustavo",
    description: "Financeiro",
    imageUrl:
      "https://media.licdn.com/dms/image/v2/D4D03AQGrU1kIUdk-Gg/profile-displayphoto-shrink_800_800/B4DZaJZEHLHwAg-/0/1746061771833?e=1761782400&v=beta&t=bkHWfk60Hd0XU__WiRdePw7Yxr9xgc5UDWcExdVs3Q4",
  },
  {
    name: "Leonardo",
    description: "Gestão de Pessoas",
    imageUrl:
      "https://media.licdn.com/dms/image/v2/D4D03AQFfB2ur3TVkhQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1695454116725?e=1761782400&v=beta&t=v7zpwg75i1Jpd9sIm4pCDKPtLKydLdic6weXxYNmZ2M",
  },
];

export async function seedDevTeams() {
  console.log("🌱 Seeding dev teams...");

  for (const teamData of devTeamsData) {
    try {
      // Check if team already exists
      const existingTeam = await db.query.devTeams.findFirst({
        where: eq(devTeams.name, teamData.name),
      });

      if (existingTeam) {
        // Update existing team
        await db
          .update(devTeams)
          .set({
            description: teamData.description,
            imageUrl: teamData.imageUrl,
            updated_at: new Date(),
          })
          .where(eq(devTeams.id, existingTeam.id));

        console.log(`✅ Updated dev team: ${teamData.name}`);
      } else {
        // Insert new team
        await db.insert(devTeams).values({
          name: teamData.name,
          description: teamData.description,
          imageUrl: teamData.imageUrl,
        });

        console.log(`✅ Created dev team: ${teamData.name}`);
      }
    } catch (error) {
      console.error(`❌ Error seeding dev team ${teamData.name}:`, error);
    }
  }

  console.log("🎉 Dev teams seeding completed!");
}

// Run seeder if called directly
if (require.main === module) {
  seedDevTeams()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
