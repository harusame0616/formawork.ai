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

	// Try approving directly WITHOUT calling getAuthorizationDetails first
	const approveResult =
		await supabase.auth.oauth.approveAuthorization(authorizationId);
	console.log("OAuth direct approve (without getAuthorizationDetails):", {
		data: approveResult.data,
		error: approveResult.error
			? {
					code: approveResult.error.code,
					message: approveResult.error.message,
					status: approveResult.error.status,
				}
			: null,
	});

	if (approveResult.error) {
		return (
			<div>
				<h1>OAuth Error</h1>
				<p>authorization_id: {authorizationId}</p>
				<p>user_id: {user.id}</p>
				<p>Error: {approveResult.error.message}</p>
				<p>Code: {approveResult.error.code}</p>
			</div>
		);
	}

	// If successful, show redirect URL
	return (
		<div>
			<h1>Authorization Successful!</h1>
			<p>Redirect URL: {approveResult.data?.redirect_url}</p>
			<p>
				<a href={approveResult.data?.redirect_url}>Click here to continue</a>
			</p>
		</div>
	);
}
