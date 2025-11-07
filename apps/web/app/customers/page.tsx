import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerSearchForm } from "./customer-search-form";
import { CustomersContainer } from "./customers-container";
import { CustomersSkeleton } from "./customers-skeleton";

export const metadata: Metadata = {
	description: "登録されている顧客の一覧を表示します",
	title: "顧客一覧",
};

type CustomersPageProps = {
	searchParams: Promise<{
		keyword?: string;
		page?: string;
	}>;
};

export default async function CustomersPage({
	searchParams,
}: CustomersPageProps) {
	const params = await searchParams;

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">顧客一覧</h1>
					<p className="text-muted-foreground mt-2">
						登録されている顧客を検索・閲覧できます
					</p>
				</div>

				<CustomerSearchForm />

				<Suspense
					fallback={<CustomersSkeleton />}
					key={`${params.keyword}-${params.page}`}
				>
					<CustomersContainer keyword={params.keyword} page={params.page} />
				</Suspense>
			</div>
		</div>
	);
}
