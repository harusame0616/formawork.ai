import { createClient } from "@repo/supabase/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const formData = await request.formData();
	const decision = formData.get("decision");
	const authorizationId = formData.get("authorization_id") as string;

	if (!authorizationId) {
		return NextResponse.json(
			{ error: "Missing authorization_id" },
			{ status: 400 },
		);
	}

	const supabase = await createClient();

	// Verify user is authenticated
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		return NextResponse.json(
			{ error: "User not authenticated" },
			{ status: 401 },
		);
	}

	if (decision === "approve") {
		const { data, error } =
			await supabase.auth.oauth.approveAuthorization(authorizationId);

		if (error) {
			console.error("OAuth approve error:", {
				authorizationId,
				error,
				userId: user.id,
			});
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		// Redirect back to the client with authorization code (303 to change POST to GET)
		return NextResponse.redirect(data.redirect_url, 303);
	} else {
		const { data, error } =
			await supabase.auth.oauth.denyAuthorization(authorizationId);

		if (error) {
			console.error("OAuth deny error:", {
				authorizationId,
				error,
				userId: user.id,
			});
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		// Redirect back to the client with error (303 to change POST to GET)
		return NextResponse.redirect(data.redirect_url, 303);
	}
}
