import { sql } from "drizzle-orm";
import { db } from "./client";
import { schemaName } from "./pgschema";

async function main() {
	console.log(
		await db.execute(
			sql.raw(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA`),
		),
	);
	const result = await db.execute(
		sql.raw(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`),
	);
	console.log(result);
	const result2 = await db.execute(
		sql.raw(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA`),
	);
	console.log(result2);
}

await main()
	.then(() => process.exit())
	.catch((error) => console.log(error));
