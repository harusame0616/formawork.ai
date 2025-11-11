import { notFound } from "next/navigation";
import { CustomerDetailPresenter } from "./customer-detail-presenter";
import { getCustomerDetail } from "./get-customer-detail";

type CustomerDetailContainerProps = {
	customerIdPromise: Promise<string>;
};

export async function CustomerDetailContainer({
	customerIdPromise,
}: CustomerDetailContainerProps) {
	const customer = await getCustomerDetail(await customerIdPromise);

	if (!customer) {
		notFound();
	}

	return <CustomerDetailPresenter customer={customer} />;
}
