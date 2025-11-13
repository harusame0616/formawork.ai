export function CustomerDetailTabsSkeleton() {
	const tabs = ["基本情報", "レポート"];

	return (
		<div className="border-b">
			<nav className="flex space-x-8">
				{tabs.map((label) => (
					<div
						className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-muted-foreground opacity-50 pointer-events-none"
						key={label}
					>
						{label}
					</div>
				))}
			</nav>
		</div>
	);
}
