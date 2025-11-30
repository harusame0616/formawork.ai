import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/features/customer/detail/get-customer-detail";
import { EditCustomerForm } from "@/features/customer/register/edit-customer-form";

type CustomerEditFormContainerProps = {
	customerIdPromise: Promise<string>;
};

export async function CustomerEditFormContainer({
	customerIdPromise,
}: CustomerEditFormContainerProps) {
	const customer = await getCustomerDetail(await customerIdPromise);

	if (!customer) {
		notFound();
	}

	return (
		<EditCustomerForm
			customerId={customer.customerId}
			initialValues={{
				email: customer.email,
				firstName: customer.firstName,
				lastName: customer.lastName,
				phone: customer.phone,
			}}
		/>
	);
}
