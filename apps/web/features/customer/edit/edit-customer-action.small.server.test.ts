import { test as base, expect, type Mock, vi } from "vitest";
import { editCustomerAction } from "./edit-customer-action";

vi.mock("next/cache", async () => ({
	updateTag: vi.fn(),
}));

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	}),
}));

vi.mock("./edit-customer", () => ({
	editCustomer: vi.fn(),
}));

vi.mock("@/features/auth/get-user-staff-id", () => ({
	getUserStaffId: vi.fn(),
}));

vi.mock("@/features/auth/get-user-role", () => ({
	getUserRole: vi.fn(),
}));

const test = base.extend<{
	getUserStaffIdMock: Mock;
	getUserRoleMock: Mock;
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
	getUserRoleMock: async ({}, use: any) => {
		const getUserRoleModule = await import("@/features/auth/get-user-role");
		const mock = vi.mocked(getUserRoleModule.getUserRole);
		await use(mock);
		vi.clearAllMocks();
	},
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
	getUserStaffIdMock: async ({}, use: any) => {
		const getUserStaffIdModule = await import(
			"@/features/auth/get-user-staff-id"
		);
		const mock = vi.mocked(getUserStaffIdModule.getUserStaffId);
		await use(mock);
		vi.clearAllMocks();
	},
});

test("認証されていない場合、認証エラーが返される", async ({
	getUserStaffIdMock,
}) => {
	const { editCustomer } = await import("./edit-customer");

	getUserStaffIdMock.mockResolvedValue(null);

	const input = {
		customerId: "00000000-0000-0000-0000-000000000001",
		email: "test@example.com",
		name: "テスト太郎",
		phone: "09012345678",
	};

	const result = await editCustomerAction(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("認証に失敗しました");
	}
	expect(editCustomer).not.toHaveBeenCalled();
});

test("一般ユーザーロールの場合、権限エラーが返される", async ({
	getUserStaffIdMock,
	getUserRoleMock,
}) => {
	const { editCustomer } = await import("./edit-customer");

	getUserStaffIdMock.mockResolvedValue("staff-id");
	getUserRoleMock.mockResolvedValue("user");

	const input = {
		customerId: "00000000-0000-0000-0000-000000000001",
		email: "test@example.com",
		name: "テスト太郎",
		phone: "09012345678",
	};

	const result = await editCustomerAction(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("この操作を実行する権限がありません");
	}
	expect(editCustomer).not.toHaveBeenCalled();
});

test("メール形式が不正な場合にバリデーションエラーを返す", async () => {
	const { editCustomer } = await import("./edit-customer");

	const input = {
		customerId: "00000000-0000-0000-0000-000000000001",
		email: "invalid-email",
		name: "テスト太郎",
		phone: "09012345678",
	};

	const result = await editCustomerAction(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(editCustomer).not.toHaveBeenCalled();
});

test("不正なcustomerIdの場合、バリデーションエラーが返される", async () => {
	const { editCustomer } = await import("./edit-customer");

	const input = {
		customerId: "invalid-uuid",
		email: "test@example.com",
		name: "テスト太郎",
		phone: "09012345678",
	};

	const result = await editCustomerAction(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(editCustomer).not.toHaveBeenCalled();
});
