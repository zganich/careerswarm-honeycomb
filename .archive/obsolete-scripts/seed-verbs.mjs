import { drizzle } from "drizzle-orm/mysql2";
import { powerVerbs } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const verbs = [
  { verb: "Generated", category: "Results", strengthScore: 9 },
  { verb: "Engineered", category: "Technical", strengthScore: 9 },
  { verb: "Reduced", category: "Efficiency", strengthScore: 8 },
  { verb: "Accelerated", category: "Speed", strengthScore: 8 },
  { verb: "Scaled", category: "Growth", strengthScore: 9 },
  { verb: "Optimized", category: "Efficiency", strengthScore: 8 },
  { verb: "Launched", category: "Initiative", strengthScore: 8 },
  { verb: "Architected", category: "Technical", strengthScore: 9 },
  { verb: "Transformed", category: "Change", strengthScore: 9 },
  { verb: "Drove", category: "Leadership", strengthScore: 7 },
  { verb: "Increased", category: "Growth", strengthScore: 7 },
  { verb: "Improved", category: "Enhancement", strengthScore: 6 },
  { verb: "Led", category: "Leadership", strengthScore: 7 },
  { verb: "Managed", category: "Leadership", strengthScore: 5 },
  { verb: "Developed", category: "Creation", strengthScore: 6 },
  { verb: "Created", category: "Creation", strengthScore: 6 },
  { verb: "Designed", category: "Creation", strengthScore: 7 },
  { verb: "Implemented", category: "Execution", strengthScore: 7 },
  { verb: "Established", category: "Foundation", strengthScore: 7 },
  { verb: "Spearheaded", category: "Leadership", strengthScore: 8 },
];

for (const verb of verbs) {
  try {
    await db.insert(powerVerbs).values(verb);
  } catch (e) {
    // Ignore duplicates
  }
}

console.log("Power verbs seeded!");
process.exit(0);
