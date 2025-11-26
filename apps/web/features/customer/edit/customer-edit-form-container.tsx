import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/features/customer/detail/get-customer-detail";
import { EditCustomerForm } from "@/features/customer/register/edit-customer-form";

type CustomerEditFormContainerProps = {
	customerIdPromise: Promise<string>;
};

export async function CustomerEditFormContainer({
	customerIdPromise,
}: CustomerEditFormContainerProps) {
	// 権限がないときはリンクを表示しないのとサーバーアクションで権限チェックを入れているので、
	// ここではロールによるアクセス制御を行わない

	const customer = await getCustomerDetail(await customerIdPromise);

	if (!customer) {
		notFound();
	}

	return (
		<EditCustomerForm
			customerId={customer.customerId}
			initialValues={{
				email: customer.email,
				name: customer.name,
				phone: customer.phone,
			}}
		/>
	);
}
