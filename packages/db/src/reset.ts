import { reset } from "drizzle-seed";
import { db } from "./client";
import * as schema from "./schema";

export async function clearDatabase() {
	console.log("🗑️ Clearing database...");

	await reset(db, schema);
}

(async () => {
	await clearDatabase();
})();
