import { redirect } from "next/navigation";

export default async function CustomerDetailPage({
	params,
}: PageProps<"/customers/[customerId]">) {
	const customerId = await params.then(({ customerId }) => customerId);
	redirect(`/customers/${customerId}/basic`);
}
