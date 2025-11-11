import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { expect, test, vi } from "vitest";
import { registerCustomerAction } from "./register-customer-action";

// Next.jsのキャッシュAPIとnavigationをモック
vi.mock("next/cache", () => ({
	revalidateTag: vi.fn(),
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

test("正常な入力で顧客が登録され、詳細ページへリダイレクトされる", async () => {
	const input = {
		email: `test-${Date.now()}@example.com`,
		name: "テスト太郎",
		phone: "090-1234-5678",
	};

	try {
		await registerCustomerAction(input);
		// redirectが呼ばれるはずなので、ここには到達しない
		expect.fail("redirect should be called");
	} catch (error) {
		// redirectはエラーをthrowするため、catchで処理
		expect(String(error)).toMatch(/NEXT_REDIRECT:\/customers\/.+/);
	}

	// データベースに登録されていることを確認
	const customers = await db
		.select()
		.from(customersTable)
		.where(eq(customersTable.email, input.email))
		.limit(1);

	expect(customers).toHaveLength(1);
	expect(customers[0]).toMatchObject({
		email: input.email,
		name: input.name,
		phone: input.phone,
	});

	// テストデータのクリーンアップ
	await db.delete(customersTable).where(eq(customersTable.email, input.email));
});

test("電話番号なしで登録できる", async () => {
	const input = {
		email: `test-no-phone-${Date.now()}@example.com`,
		name: "テスト花子",
		phone: "",
	};

	try {
		await registerCustomerAction(input);
	} catch (error) {
		expect(String(error)).toMatch(/NEXT_REDIRECT:\/customers\/.+/);
	}

	const customers = await db
		.select()
		.from(customersTable)
		.where(eq(customersTable.email, input.email))
		.limit(1);

	expect(customers).toHaveLength(1);
	expect(customers[0]?.phone).toBeNull();

	// テストデータのクリーンアップ
	await db.delete(customersTable).where(eq(customersTable.email, input.email));
});

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
		description: "email プロパティが欠けている",
		input: { name: "テスト太郎", phone: "" },
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
		description: "email が空文字列",
		input: { email: "", name: "テスト太郎", phone: "" },
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
