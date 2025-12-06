import { createAdminClient } from "@repo/supabase/admin";

type VerifyTokenResult = {
	userId: string;
	email: string | undefined;
} | null;

export async function verifySupabaseToken(
	token: string,
): Promise<VerifyTokenResult> {
	const supabase = createAdminClient();

	console.log("[MCP Auth] Calling supabase.auth.getUser...");
	const { data, error } = await supabase.auth.getUser(token);

	if (error) {
		console.log("[MCP Auth] getUser error:", error.message, error.code);
		return null;
	}

	if (!data.user) {
		console.log("[MCP Auth] No user in response");
		return null;
	}

	console.log("[MCP Auth] User found:", data.user.id, data.user.email);

	return {
		email: data.user.email,
		userId: data.user.id,
	};
}
