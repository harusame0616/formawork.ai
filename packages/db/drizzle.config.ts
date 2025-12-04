import { defineConfig } from "drizzle-kit";
import { databaseUrl } from "./src/client";
import { schemaName } from "./src/pgschema";

export default defineConfig({
	breakpoints: false,
	dbCredentials: {
		url: databaseUrl.toString(),
	},
	dialect: "postgresql",
	migrations: {
		schema: schemaName,
	},
	out: "./drizzle",
	schema: "./src/schema/index.ts",
});

console.log("drizzle kig config", {
	databaseHost: databaseUrl.hostname,
	databaseName: databaseUrl.pathname,
	databasePort: databaseUrl.port,
	databaseSearchParams: databaseUrl.searchParams,
	schemaName,
});
