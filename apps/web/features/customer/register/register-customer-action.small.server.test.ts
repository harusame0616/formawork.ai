import { expect, test, vi } from "vitest";
import { registerCustomerAction } from "./register-customer-action";

// Next.jsのキャッシュAPIとnavigationをモック
vi.mock("next/cache", () => ({
	updateTag: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	RedirectType: {
		push: "push",
		replace: "replace",
	},
	redirect: vi.fn((url: string) => {
		throw new Error(`NEXT_REDIRECT:${url}`);
	}),
}));

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	}),
}));

// データベース操作をモック
vi.mock("@workspace/db/client", () => ({
	db: {
		insert: vi.fn(),
		select: vi.fn(),
	},
}));

test.each([
	{ description: "引数が undefined", input: undefined },
	{ description: "引数が null", input: null },
	{ description: "引数が数値", input: 123 },
	{ description: "引数が配列", input: [] },
	{ description: "引数が空オブジェクト", input: {} },
	{
		description: "name プロパティが欠けている",
		input: { email: "test@example.com", phone: "" },
	},
	{
		description: "name が数値",
		input: { email: "test@example.com", name: 123, phone: "" },
	},
	{
		description: "email が数値",
		input: { email: 123, name: "テスト太郎", phone: "" },
	},
	{
		description: "name が空文字列",
		input: { email: "test@example.com", name: "", phone: "" },
	},
	{
		description: "email がメール形式でない",
		input: { email: "invalid-email", name: "テスト太郎", phone: "" },
	},
	{
		description: "name が25文字（24文字超過）",
		input: {
			email: "test@example.com",
			name: "あ".repeat(25),
			phone: "",
		},
	},
	{
		description: "email が255文字（254文字超過）",
		input: {
			email: `${"a".repeat(243)}@example.com`, // 243 + 1(@) + 11(example.com) = 255文字
			name: "テスト太郎",
			phone: "",
		},
	},
	{
		description: "phone が21文字（20文字超過）",
		input: {
			email: "test@example.com",
			name: "テスト太郎",
			phone: "0".repeat(21),
		},
	},
])("$description の場合、バリデーションエラーを返す", async ({ input }) => {
	// @ts-expect-error - サーバーアクションは任意の引数で呼び出される可能性がある
	const result = await registerCustomerAction(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
});
