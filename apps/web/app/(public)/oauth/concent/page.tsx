// app/oauth/consent/page.tsx
import { createClient } from "@repo/supabase/nextjs/server";
import { redirect } from "next/navigation";

export default async function ConsentPage({
	searchParams,
}: {
	searchParams: { authorization_id?: string };
}) {
	const authorizationId = searchParams.authorization_id;
	if (!authorizationId) {
		return <div>Error: Missing authorization_id</div>;
	}

	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		// Redirect to login, preserving authorization_id
		redirect(
			`/login?redirect=/oauth/consent?authorization_id=${authorizationId}`,
		);
	}
	// Get authorization details using the authorization_id
	const { data: authDetails, error } =
		await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

	if (error || !authDetails) {
		return (
			<div>Error: {error?.message || "Invalid authorization request"}</div>
		);
	}
	return (
		<div>
			<h1>Authorize {authDetails.client.name}</h1>
			<p>This application wants to access your account.</p>
			<div>
				<p>
					<strong>Client:</strong> {authDetails.client.name}
				</p>
				<p>
					<strong>Redirect URI:</strong> {authDetails.redirect_uri}
				</p>
				{authDetails.scopes && authDetails.scopes.length > 0 && (
					<div>
						<strong>Requested permissions:</strong>
						<ul>
							{authDetails.scopes.map((scope) => (
								<li key={scope}>{scope}</li>
							))}
						</ul>
					</div>
				)}
			</div>
			<form action="/api/oauth/decision" method="POST">
				<input name="authorization_id" type="hidden" value={authorizationId} />
				<button name="decision" type="submit" value="approve">
					Approve
				</button>
				<button name="decision" type="submit" value="deny">
					Deny
				</button>
			</form>
		</div>
	);
}
