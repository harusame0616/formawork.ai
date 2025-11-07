import { Skeleton } from "@workspace/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";

export function CustomersSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-10 w-[300px]" />
			</div>

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
						{Array.from({ length: 5 }).map((_, index) => (
							<TableRow key={index}>
								<TableCell>
									<Skeleton className="h-5 w-[200px]" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-[250px]" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-[140px]" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-center gap-2">
				<Skeleton className="h-10 w-[80px]" />
				<Skeleton className="h-10 w-[100px]" />
				<Skeleton className="h-10 w-[80px]" />
			</div>
		</div>
	);
}
