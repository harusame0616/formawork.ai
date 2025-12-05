import { cn } from "@workspace/ui/lib/utils";
import { Loader } from "lucide-react";

export function LoadingIcon({ className }: { className?: string }) {
	return (
		<Loader aria-hidden className={cn("size-4 animate-spin", className)} />
	);
}
