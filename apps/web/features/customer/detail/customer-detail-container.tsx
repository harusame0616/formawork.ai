import { notFound } from "next/navigation";
import { CustomerDetailPresenter } from "./customer-detail-presenter";
import { getCustomerDetail } from "./get-customer-detail";

type CustomerDetailContainerProps = {
	customerIdPromise: Promise<string>;
};

export async function CustomerDetailContainer({
	customerIdPromise,
}: CustomerDetailContainerProps) {
	try {
		const customer = await getCustomerDetail(await customerIdPromise);

		if (!customer) {
			notFound();
		}

		return <CustomerDetailPresenter customer={customer} />;
	} catch (_e) {
		// デバッグのためエラー内容出力
		return (
			<div>
				データ取得でエラーが発生しました<div> {JSON.stringify(_e)}</div>
			</div>
		);
	}
}
