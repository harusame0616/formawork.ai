import type { Mock } from "vitest";
import { test as base, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { EditCustomerForm } from "./edit-customer-form";

// registerCustomerAction をモック
vi.mock("./register-customer-action", () => ({
	registerCustomerAction: vi.fn(),
}));

const test = base.extend<{
	registerCustomerActionMock: Mock;
}>({
	registerCustomerActionMock: async (
		// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
		{},
		// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
		use: any,
	) => {
		const registerCustomerActionModule = await import(
			"./register-customer-action"
		);
		await use(registerCustomerActionModule.registerCustomerAction);
		vi.clearAllMocks();
	},
});

test("名前が空の場合、バリデーションエラーが表示される", async () => {
	render(<EditCustomerForm />);

	// メールアドレスだけを入力
	await page.getByLabelText("メールアドレス（任意）").fill("test@example.com");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("名前を入力してください"))
		.toBeInTheDocument();
});

test("メールアドレスの形式が不正な場合、バリデーションエラーが表示される", async () => {
	render(<EditCustomerForm />);

	// 不正な形式のメールアドレスを入力
	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス（任意）").fill("invalid-email");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("正しいメールアドレス形式で入力してください"))
		.toBeInTheDocument();
});

test("送信中はボタンが無効化され、ローディング表示になる", async ({
	registerCustomerActionMock,
}) => {
	registerCustomerActionMock.mockReturnValue(new Promise(() => {}));

	render(<EditCustomerForm />);

	// 有効な入力
	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス（任意）").fill("test@example.com");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// 送信中の状態を確認
	const button = page.getByRole("button", { name: /登録中/ });

	await expect.element(button).toBeDisabled();
	await expect.element(page.getByText("登録中...")).toBeInTheDocument();
});

test("登録エラー時にエラーメッセージが表示される", async ({
	registerCustomerActionMock,
}) => {
	// registerCustomerAction がエラーを返すようにモック
	registerCustomerActionMock.mockResolvedValue({
		error: "サーバーエラーが発生しました。時間をおいて再度お試しください",
		success: false,
	});

	render(<EditCustomerForm />);

	// 有効な入力
	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス（任意）").fill("test@example.com");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// エラーメッセージが表示されることを確認
	await expect.element(page.getByRole("alert")).toBeInTheDocument();
	await expect
		.element(
			page.getByText(
				"サーバーエラーが発生しました。時間をおいて再度お試しください",
			),
		)
		.toBeInTheDocument();
});

test("メールアドレスは任意で、未入力でも送信できる", async ({
	registerCustomerActionMock,
}) => {
	// 登録失敗をモック（送信されたことを確認するため）
	registerCustomerActionMock.mockResolvedValue({
		error: "テストエラー",
		success: false,
	});

	render(<EditCustomerForm />);

	// 名前のみ入力
	await page.getByLabelText("名前").fill("テスト太郎");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// registerCustomerActionが呼ばれたことを確認（バリデーションを通過した証拠）
	expect(registerCustomerActionMock).toHaveBeenCalled();
});

test("電話番号は任意で、未入力でも送信できる", async ({
	registerCustomerActionMock,
}) => {
	// 登録失敗をモック（送信されたことを確認するため）
	registerCustomerActionMock.mockResolvedValue({
		error: "テストエラー",
		success: false,
	});

	render(<EditCustomerForm />);

	// 名前とメールアドレスのみ入力
	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス（任意）").fill("test@example.com");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// registerCustomerActionが呼ばれたことを確認（バリデーションを通過した証拠）
	expect(registerCustomerActionMock).toHaveBeenCalled();
});

test("名前が24文字を超える場合、バリデーションエラーが表示される", async ({
	registerCustomerActionMock,
}) => {
	render(<EditCustomerForm />);

	// 25文字の名前を入力
	const longName = "あ".repeat(25);
	await page.getByLabelText("名前").fill(longName);
	await page.getByLabelText("メールアドレス（任意）").fill("test@example.com");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("名前は24文字以内で入力してください"))
		.toBeInTheDocument();

	expect(registerCustomerActionMock).not.toHaveBeenCalled();
});

test("メールアドレスが254文字を超える場合、バリデーションエラーが表示される", async ({
	registerCustomerActionMock,
}) => {
	render(<EditCustomerForm />);

	// 255文字のメールアドレスを入力 (243 + 1(@) + 11(example.com) = 255文字)
	const longEmail = `${"a".repeat(243)}@example.com`;
	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス（任意）").fill(longEmail);

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("メールアドレスは254文字以内で入力してください"))
		.toBeInTheDocument();

	expect(registerCustomerActionMock).not.toHaveBeenCalled();
});

test("電話番号が20文字を超える場合、バリデーションエラーが表示される", async ({
	registerCustomerActionMock,
}) => {
	render(<EditCustomerForm />);

	// 21文字の電話番号を入力
	const longPhone = "0".repeat(21);
	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス（任意）").fill("test@example.com");
	await page.getByLabelText("電話番号（任意）").fill(longPhone);

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("電話番号は20文字以内で入力してください"))
		.toBeInTheDocument();

	expect(registerCustomerActionMock).not.toHaveBeenCalled();
});

test("名前が24文字（境界値）の場合、送信できる", async ({
	registerCustomerActionMock,
}) => {
	// 登録失敗をモック
	registerCustomerActionMock.mockResolvedValue({
		error: "テストエラー",
		success: false,
	});

	render(<EditCustomerForm />);

	// 24文字の名前を入力
	const boundaryName = "あ".repeat(24);
	await page.getByLabelText("名前").fill(boundaryName);
	await page.getByLabelText("メールアドレス（任意）").fill("test@example.com");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// 文字数制限のバリデーションエラーが表示されないことを確認
	await expect
		.element(page.getByText("名前は24文字以内で入力してください"))
		.not.toBeInTheDocument();

	// registerCustomerActionが呼ばれたことを確認（バリデーションを通過した証拠）
	expect(registerCustomerActionMock).toHaveBeenCalled();
});

test("メールアドレスが254文字（境界値）の場合、送信できる", async ({
	registerCustomerActionMock,
}) => {
	// 登録失敗をモック
	registerCustomerActionMock.mockResolvedValue({
		error: "テストエラー",
		success: false,
	});

	render(<EditCustomerForm />);

	// 254文字のメールアドレスを入力 (242 + 1(@) + 11(example.com) = 254文字)
	const boundaryEmail = `${"a".repeat(242)}@example.com`;
	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス（任意）").fill(boundaryEmail);

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// 文字数制限のバリデーションエラーが表示されないことを確認
	await expect
		.element(page.getByText("メールアドレスは254文字以内で入力してください"))
		.not.toBeInTheDocument();

	// registerCustomerActionが呼ばれたことを確認（バリデーションを通過した証拠）
	expect(registerCustomerActionMock).toHaveBeenCalled();
});

test("電話番号が20文字（境界値）の場合、送信できる", async ({
	registerCustomerActionMock,
}) => {
	// 登録失敗をモック
	registerCustomerActionMock.mockResolvedValue({
		error: "テストエラー",
		success: false,
	});

	render(<EditCustomerForm />);

	// 20文字の電話番号を入力
	const boundaryPhone = "0".repeat(20);
	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス（任意）").fill("test@example.com");
	await page.getByLabelText("電話番号（任意）").fill(boundaryPhone);

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// 文字数制限のバリデーションエラーが表示されないことを確認
	await expect
		.element(page.getByText("電話番号は20文字以内で入力してください"))
		.not.toBeInTheDocument();

	// registerCustomerActionが呼ばれたことを確認（バリデーションを通過した証拠）
	expect(registerCustomerActionMock).toHaveBeenCalled();
});
