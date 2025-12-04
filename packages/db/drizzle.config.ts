import { defineConfig } from "drizzle-kit";
import * as v from "valibot";
import { schemaName } from "./src/pgschema";

const directUrl = new URL(
	v.parse(
		v.pipe(
			v.string("directUrl は文字列である必要があります"),
			v.nonEmpty("directUrl は1文字以上である必要があります"),
			v.url("directUrl は URL である必要があります"),
		),
		// biome-ignore lint/complexity/useLiteralKeys: ts4111
		process.env["DIRECT_URL"],
	),
);
// SUPABASE の session pooler では schema、直接接続の場合は search_path を使うため、
// schemaName が public かどうかでリモートかローカル化を判定してパラメーター名を修正
directUrl.searchParams.set(
	schemaName === "public" ? "search_path" : "schema",
	schemaName,
);

export default defineConfig({
	breakpoints: false,
	dbCredentials: {
		url: directUrl.toString(),
	},
	dialect: "postgresql",
	migrations: {
		schema: schemaName,
	},
	out: "./drizzle",
	schema: "./src/schema/index.ts",
});

console.log("drizzle kig config", {
	databaseHost: directUrl.hostname,
	databaseName: directUrl.pathname,
	databasePort: directUrl.port,
	databaseSearchParams: directUrl.searchParams,
	schemaName,
});
