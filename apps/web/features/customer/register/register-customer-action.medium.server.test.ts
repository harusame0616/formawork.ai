import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
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
		phone: "09012345678", // ハイフンが削除される
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

test("name が24文字（境界値）で登録できる", async () => {
	const input = {
		email: `test-name-24-${Date.now()}@example.com`,
		name: "あ".repeat(24), // 境界値: 24文字
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
	expect(customers[0]?.name).toBe(input.name);

	// テストデータのクリーンアップ
	await db.delete(customersTable).where(eq(customersTable.email, input.email));
});

test("email が254文字（境界値）で登録できる", async () => {
	// 254文字のメールアドレス: 242文字 + @ + example.com (11文字) = 254文字
	const input = {
		email: `${"a".repeat(242)}@example.com`,
		name: "テスト太郎",
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
	expect(customers[0]?.email).toBe(input.email);

	// テストデータのクリーンアップ
	await db.delete(customersTable).where(eq(customersTable.email, input.email));
});

test("phone が20文字（境界値）で登録できる", async () => {
	const input = {
		email: `test-phone-20-${Date.now()}@example.com`,
		name: "テスト太郎",
		phone: "0".repeat(20), // 境界値: 20文字
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
	expect(customers[0]?.phone).toBe(input.phone);

	// テストデータのクリーンアップ
	await db.delete(customersTable).where(eq(customersTable.email, input.email));
});
