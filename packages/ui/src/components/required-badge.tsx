import { Badge } from "./badge";

export function RequiredBadge() {
	return (
		<Badge className="border-destructive text-destructive" variant="outline">
			必須
		</Badge>
	);
}
