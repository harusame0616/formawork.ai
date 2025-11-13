import { Suspense } from "react";
import { CustomerDetailTabs } from "../../../../features/customer/detail/customer-detail-tabs";
import { CustomerDetailTabsSkeleton } from "../../../../features/customer/detail/customer-detail-tabs-skeleton";
import { CustomerInfoContainer } from "../../../../features/customer/detail/customer-info-container";
import { CustomerInfoSkeleton } from "../../../../features/customer/detail/customer-info-skeleton";

export default async function CustomerDetailLayout({
	params,
	children,
}: LayoutProps<"/customers/[customerId]">) {
	const customerIdPromise = params.then(({ customerId }) => customerId);

	return (
		<div className="container mx-auto">
			<div className="p-4">
				<Suspense fallback={<CustomerInfoSkeleton />}>
					<CustomerInfoContainer customerIdPromise={customerIdPromise} />
				</Suspense>
			</div>

			<Suspense fallback={<CustomerDetailTabsSkeleton />}>
				<CustomerDetailTabs customerIdPromise={customerIdPromise} />
			</Suspense>

			<div className="p-4">{children}</div>
		</div>
	);
}
