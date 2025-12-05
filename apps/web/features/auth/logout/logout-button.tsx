"use client";

import { Button } from "@workspace/ui/components/button";
import { useTransition } from "react";
import { logoutAction } from "./logout-action";

export function LogoutButton() {
	const [isPending, startTransition] = useTransition();

	const handleOnClick = () => {
		startTransition(async () => {
			await logoutAction();
		});
	};

	return (
		<Button
			className="w-full justify-start"
			isProcessing={isPending}
			onClick={handleOnClick}
			processingLabel="ログアウト中"
			variant="ghost"
		>
			ログアウト
		</Button>
	);
}
