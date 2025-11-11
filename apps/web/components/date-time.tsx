"use client";

import { useSyncExternalStore } from "react";

type DateTimeProps = {
	date: Date;
};

export function DateTime({ date }: DateTimeProps) {
	const formatted = useSyncExternalStore(
		() => () => {},
		() =>
			date.toLocaleDateString("ja-JP", {
				day: "numeric",
				month: "long",
				year: "numeric",
			}),
		() => date.toISOString(),
	);

	return <time dateTime={date.toISOString()}>{formatted}</time>;
}
