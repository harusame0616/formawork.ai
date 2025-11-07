"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function CustomerSearchForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const params = new URLSearchParams(searchParams);

		if (keyword.trim()) {
			params.set("keyword", keyword.trim());
		} else {
			params.delete("keyword");
		}

		// Reset to page 1 when searching
		params.delete("page");

		router.push(`/customers?${params.toString()}`);
	}

	function handleClear() {
		setKeyword("");
		const params = new URLSearchParams(searchParams);
		params.delete("keyword");
		params.delete("page");
		router.push(`/customers?${params.toString()}`);
	}

	return (
		<form className="flex gap-2" onSubmit={handleSubmit}>
			<div className="relative flex-1 max-w-md">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<Input
					className="pl-9"
					onChange={(e) => setKeyword(e.target.value)}
					placeholder="名前またはメールアドレスで検索"
					type="text"
					value={keyword}
				/>
			</div>
			<Button type="submit">検索</Button>
			{keyword && (
				<Button onClick={handleClear} type="button" variant="outline">
					クリア
				</Button>
			)}
		</form>
	);
}
