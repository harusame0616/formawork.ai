import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { getUserRole, UserRole } from "@/features/auth/get-user-role";
import { DeleteCustomerDialog } from "@/features/customer/delete/delete-customer-dialog";

export default function Page({ params }: PageProps<"/customers/[customerId]">) {
	const customerIdPromise = params.then(({ customerId }) => customerId);

	return (
		<Suspense fallback={<Skeleton className="h-4 w-20 bg-black/10" />}>
			<Action customerIdPromise={customerIdPromise} />
		</Suspense>
	);
}

async function Action({
	customerIdPromise,
}: {
	customerIdPromise: Promise<string>;
}) {
	const customerId = await customerIdPromise;
	const isAdmin = (await getUserRole()) === UserRole.Admin;

	return isAdmin ? (
		<div className="flex items-center gap-2">
			<Link
				className="text-primary underline flex items-center gap-1"
				href={`/customers/${customerId}/edit`}
			>
				編集
			</Link>
			<DeleteCustomerDialog customerId={customerId} />
		</div>
	) : null;
}
