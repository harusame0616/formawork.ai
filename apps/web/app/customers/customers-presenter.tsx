import { Button } from "@workspace/ui/components/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { GetCustomersResult } from "../../features/customer/get-customers";

type CustomersPresenterProps = {
	data: GetCustomersResult;
	keyword?: string;
};

export function CustomersPresenter({ data, keyword }: CustomersPresenterProps) {
	const { customers, page, totalPages, total } = data;

	return (
		<div className="space-y-4">
			{/* Results summary */}
			<div className="text-sm text-muted-foreground">
				{keyword && <span>「{keyword}」の検索結果: </span>}
				{total}件
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[300px]">名前</TableHead>
							<TableHead>メールアドレス</TableHead>
							<TableHead className="w-[180px]">登録日</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{customers.length === 0 ? (
							<TableRow>
								<TableCell className="text-center py-8" colSpan={3}>
									{keyword
										? "該当する顧客が見つかりませんでした"
										: "顧客が登録されていません"}
								</TableCell>
							</TableRow>
						) : (
							customers.map((customer) => (
								<TableRow key={customer.customerId}>
									<TableCell className="font-medium">{customer.name}</TableCell>
									<TableCell>{customer.email}</TableCell>
									<TableCell>
										{new Date(customer.createdAt).toLocaleDateString("ja-JP", {
											day: "2-digit",
											month: "2-digit",
											year: "numeric",
										})}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						asChild={page > 1}
						disabled={page <= 1}
						size="sm"
						variant="outline"
					>
						{page > 1 ? (
							<Link
								href={`/customers?${new URLSearchParams({
									...(keyword ? { keyword } : {}),
									page: String(page - 1),
								}).toString()}`}
							>
								<ChevronLeft className="size-4 mr-1" />
								前へ
							</Link>
						) : (
							<>
								<ChevronLeft className="size-4 mr-1" />
								前へ
							</>
						)}
					</Button>

					<span className="text-sm text-muted-foreground px-4">
						{page} / {totalPages}
					</span>

					<Button
						asChild={page < totalPages}
						disabled={page >= totalPages}
						size="sm"
						variant="outline"
					>
						{page < totalPages ? (
							<Link
								href={`/customers?${new URLSearchParams({
									...(keyword ? { keyword } : {}),
									page: String(page + 1),
								}).toString()}`}
							>
								次へ
								<ChevronRight className="size-4 ml-1" />
							</Link>
						) : (
							<>
								次へ
								<ChevronRight className="size-4 ml-1" />
							</>
						)}
					</Button>
				</div>
			)}
		</div>
	);
}
