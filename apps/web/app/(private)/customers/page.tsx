import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Suspense } from "react";
import { CustomerSearchFormContainer } from "@/features/customer/list/customer-search-form-container";
import { CustomerSearchForm } from "@/features/customer/list/customer-search-form-presenter";
import { CustomersContainer } from "@/features/customer/list/customers-container";
import { CustomersSkeleton } from "@/features/customer/list/customers-skeleton";
import { parseCustomersConditionSearchParams } from "@/features/customer/list/schema";
import { RegisterNewCustomerLinkContainer } from "@/features/customer/register/register-new-customer-link-container";
import { SuspenseOnSearch } from "@/libs/suspense-on-search";

export default function Page({ searchParams }: PageProps<"/customers">) {
	const validatedCondition = searchParams.then(
		(params) => parseCustomersConditionSearchParams(params).data,
	);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="font-bold">顧客一覧</h1>
				<Suspense fallback={<Skeleton className="h-4 w-16" />}>
					<RegisterNewCustomerLinkContainer />
				</Suspense>
			</div>
			<Card className="p-4 w-full">
				<SuspenseOnSearch
					fallback={<CustomerSearchForm condition={{ keyword: "" }} />}
				>
					<CustomerSearchFormContainer conditionPromise={validatedCondition} />
				</SuspenseOnSearch>
			</Card>
			<Card className="py-2 w-full">
				<SuspenseOnSearch fallback={<CustomersSkeleton />}>
					<CustomersContainer condition={validatedCondition} />
				</SuspenseOnSearch>
			</Card>
		</div>
	);
}
