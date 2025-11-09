import * as v from "valibot";
import type { LoggerConfig } from "./types";

export function getLoggerConfig(): LoggerConfig {
	return v.parse(
		v.object({
			application: v.string(),
			environment: v.optional(
				v.picklist(["development", "staging", "production"]),
				"development",
			),
			level: v.optional(
				v.picklist([
					"fatal",
					"error",
					"warn",
					"info",
					"debug",
					"trace",
					"silent",
				]),
				"info",
			),
			service: v.string(),
		}),
		{
			// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
			application: process.env["APP_NAME"],
			// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
			environment: process.env["HOST_ENVIRONMENT"],
			// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
			level: process.env["LOG_LEVEL"],
			// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
			service: process.env["SERVICE_NAME"],
		},
	);
}
