import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifySupabaseToken } from "./auth";
import { registerCustomerTools } from "./tools/customers";

const handler = createMcpHandler(
	(server) => {
		registerCustomerTools(server);
	},
	{},
	{
		basePath: "/api/mcp",
		maxDuration: 60,
		verboseLogs: true, // Temporarily enabled for debugging
	},
);

async function verifyToken(
	_req: Request,
	bearerToken?: string,
): Promise<AuthInfo | undefined> {
	console.log("[MCP Auth] verifyToken called, hasToken:", !!bearerToken);

	if (!bearerToken) {
		console.log("[MCP Auth] No bearer token provided");
		return undefined;
	}

	console.log("[MCP Auth] Token prefix:", `${bearerToken.substring(0, 50)}...`);

	const user = await verifySupabaseToken(bearerToken);

	if (!user) {
		console.log("[MCP Auth] Token verification failed");
		return undefined;
	}

	console.log("[MCP Auth] Token verified successfully, userId:", user.userId);

	return {
		clientId: "formawork",
		extra: {
			email: user.email,
			userId: user.userId,
		},
		scopes: [],
		token: bearerToken,
	};
}

export const authHandler = withMcpAuth(handler, verifyToken, {
	required: true,
	resourceMetadataPath: "/.well-known/oauth-protected-resource/mcp",
});
