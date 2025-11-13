import { notFound } from "next/navigation";
import { CustomerBasicInfoPresenter } from "./customer-basic-info-presenter";
import { getCustomerDetail } from "./get-customer-detail";

type CustomerBasicInfoContainerProps = {
	customerIdPromise: Promise<string>;
};

export async function CustomerBasicInfoContainer({
	customerIdPromise,
}: CustomerBasicInfoContainerProps) {
	const customer = await getCustomerDetail(await customerIdPromise);

	if (!customer) {
		notFound();
	}

	return <CustomerBasicInfoPresenter customer={customer} />;
}
