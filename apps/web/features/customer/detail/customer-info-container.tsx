import { notFound } from "next/navigation";
import { CustomerInfoPresenter } from "./customer-info-presenter";
import { getCustomerDetail } from "./get-customer-detail";

type CustomerInfoContainerProps = {
	customerIdPromise: Promise<string>;
};

export async function CustomerInfoContainer({
	customerIdPromise,
}: CustomerInfoContainerProps) {
	const customer = await getCustomerDetail(await customerIdPromise);

	if (!customer) {
		notFound();
	}

	return (
		<CustomerInfoPresenter
			firstName={customer.firstName}
			lastName={customer.lastName}
		/>
	);
}
