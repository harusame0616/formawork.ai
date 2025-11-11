import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import { CustomerDetailContainer } from "../../../../features/customer/detail/customer-detail-container";
import { CustomerDetailSkeleton } from "../../../../features/customer/detail/customer-detail-skeleton";

type CustomerDetailPageProps = {
	params: Promise<{
		customerId: string;
	}>;
};

export default function CustomerDetailPage({
	params,
}: CustomerDetailPageProps) {
	const customerIdPromise = params.then((p) => p.customerId);

	return (
		<div className="container mx-auto p-2 space-y-4">
			<h1 className="font-bold">顧客詳細</h1>
			<Card className="p-4 w-full">
				<Suspense fallback={<CustomerDetailSkeleton />}>
					<CustomerDetailContainer customerIdPromise={customerIdPromise} />
				</Suspense>
			</Card>
		</div>
	);
}
