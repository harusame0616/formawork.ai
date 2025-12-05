import { createClient } from "@repo/supabase/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function ConsentPage({
	searchParams,
}: {
	searchParams: Promise<{ authorization_id?: string }>;
}) {
	const authorizationIdPromise = searchParams.then((sp) => sp.authorization_id);

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ConsentContent authorizationIdPromise={authorizationIdPromise} />
		</Suspense>
	);
}

async function ConsentContent({
	authorizationIdPromise,
}: {
	authorizationIdPromise: Promise<string | undefined>;
}) {
	const authorizationId = await authorizationIdPromise;

	if (!authorizationId) {
		return <div>Error: Missing authorization_id</div>;
	}

	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(
			`/login?redirect=/oauth/consent?authorization_id=${authorizationId}`,
		);
	}

	const { data: authDetails, error } =
		await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

	console.log("OAuth authDetails:", JSON.stringify(authDetails, null, 2));

	if (error || !authDetails) {
		return (
			<div>Error: {error?.message || "Invalid authorization request"}</div>
		);
	}

	async function approveAction() {
		"use server";
		const supabase = await createClient();
		const { data, error } = await supabase.auth.oauth.approveAuthorization(
			authorizationId!,
		);

		if (error) {
			console.error("OAuth approve error (server action):", {
				authorizationId,
				error: {
					code: error.code,
					message: error.message,
					status: error.status,
				},
			});
			throw new Error(error.message);
		}

		console.log("OAuth approve success:", data);
		redirect(data.redirect_url);
	}

	async function denyAction() {
		"use server";
		const supabase = await createClient();
		const { data, error } = await supabase.auth.oauth.denyAuthorization(
			authorizationId!,
		);

		if (error) {
			console.error("OAuth deny error (server action):", error);
			throw new Error(error.message);
		}

		redirect(data.redirect_url);
	}

	return (
		<div>
			<h1>Authorize {JSON.stringify(authDetails.user)}</h1>
			<p>This application wants to access your account.</p>
			<div>{authDetails.scope}</div>
			<form>
				<button formAction={approveAction} type="submit">
					Approve
				</button>
				<button formAction={denyAction} type="submit">
					Deny
				</button>
			</form>
		</div>
	);
}
