import * as v from "valibot";

export function getLoggerConfig() {
	return v.parse(
		v.object({
			deploymentId: v.optional(v.string()),
			gitCommitSha: v.optional(v.string()),
		}),
		{
			// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
			deploymentId: process.env["VERCEL_DEPLOYMENT_ID"],
			// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
			gitCommitSha: process.env["VERCEL_GIT_COMMIT_SHA"],
		},
	);
}
