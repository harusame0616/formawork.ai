import { createDbClient } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { Button } from "@workspace/ui/components/button";
import { cacheTag, updateTag } from "next/cache";
import { Suspense } from "react";

const TAG_CUSTOMER = "tag_customer";

async function insertCustomer() {
	"use server";

	const client = createDbClient();
	await client.insert(customersTable).values({
		customerId: crypto.randomUUID(),
		email: `${crypto.randomUUID()}@example.com`,
		name: crypto.randomUUID(),
	});

	updateTag(TAG_CUSTOMER);
}

export default async function Home() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<Suspense fallback={<div>loading</div>}>
				<CustomersContainer />
			</Suspense>
			<form action={insertCustomer}>
				<Button>test</Button>
			</form>
		</div>
	);
}

function getCustomerNames() {
	const client = createDbClient();

	return client
		.select({
			name: customersTable.name,
		})
		.from(customersTable)
		.then((customers) => customers.map(({ name }) => name));
}

async function CustomersContainer() {
	"use cache";

	cacheTag(TAG_CUSTOMER);

	const names = await getCustomerNames();

	return <CustomersPresenter names={names} />;
}

async function CustomersPresenter({ names }: { names: string[] }) {
	return (
		<ul>
			{names.map((name) => (
				<li key={name}>{name}</li>
			))}
		</ul>
	);
}
