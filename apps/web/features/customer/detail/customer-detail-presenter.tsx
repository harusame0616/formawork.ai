import { DateTime } from "../../../components/date-time";

type Customer = {
	createdAt: Date;
	customerId: string;
	email: string | null;
	name: string;
	phone: string | null;
	updatedAt: Date;
};

type CustomerDetailPresenterProps = {
	customer: Customer;
};

export function CustomerDetailPresenter({
	customer,
}: CustomerDetailPresenterProps) {
	return (
		<div className="space-y-4">
			<div className="grid gap-2">
				<div className="text-sm text-muted-foreground">名前</div>
				<div className="font-bold">{customer.name}</div>
			</div>
			<div className="grid gap-2">
				<div className="text-sm text-muted-foreground">メールアドレス</div>
				<div className="font-bold">
					{customer.email ? (
						<a
							className="text-primary underline"
							href={`mailto:${customer.email}`}
						>
							{customer.email}
						</a>
					) : (
						"未登録"
					)}
				</div>
			</div>
			<div className="grid gap-2">
				<div className="text-sm text-muted-foreground">電話番号</div>
				<div className="font-bold">
					{customer.phone ? (
						<a
							className="text-primary underline"
							href={`tel:${customer.phone}`}
						>
							{customer.phone}
						</a>
					) : (
						"未登録"
					)}
				</div>
			</div>
			<div className="grid gap-2">
				<div className="text-sm text-muted-foreground">登録日</div>
				<div className="font-bold">
					<DateTime date={customer.createdAt} />
				</div>
			</div>
			<div className="grid gap-2">
				<div className="text-sm text-muted-foreground">更新日</div>
				<div className="font-bold">
					<DateTime date={customer.updatedAt} />
				</div>
			</div>
		</div>
	);
}
