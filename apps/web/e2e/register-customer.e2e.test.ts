import { test as base, expect, type Page } from "@playwright/test";

type RegisterCustomerPageFixture = {
	registerCustomerPage: Page;
	testUser: {
		email: string;
		password: string;
	};
};

const test = base.extend<RegisterCustomerPageFixture>({
	registerCustomerPage: async ({ page }, use) => {
		const testUser = {
			email: "test1@example.com",
			password: "Test@Pass123",
		};

		// ログイン処理
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");

		// 新規顧客登録ページに遷移
		await page.goto("/customers/new");
		await page.waitForURL("/customers/new");

		await use(page);
	},
});

test("新規顧客登録ページが正しく表示される", async ({
	registerCustomerPage,
}) => {
	await test.step("ページタイトルを確認", async () => {
		await expect(registerCustomerPage.getByText("新規顧客登録")).toBeVisible();
	});

	await test.step("フォームフィールドが表示されることを確認", async () => {
		await expect(registerCustomerPage.getByLabel("名前")).toBeVisible();
		await expect(
			registerCustomerPage.getByLabel("メールアドレス"),
		).toBeVisible();
		await expect(
			registerCustomerPage.getByLabel("電話番号（任意）"),
		).toBeVisible();
		await expect(
			registerCustomerPage.getByRole("button", { name: "登録する" }),
		).toBeVisible();
	});
});

test("全フィールドを入力して顧客を登録し、詳細ページに遷移する", async ({
	registerCustomerPage,
}) => {
	const uniqueId = Date.now();
	const testData = {
		email: `e2e-test-${uniqueId}@example.com`,
		name: `E2Eテスト太郎_${uniqueId}`,
		phone: "090-1234-5678",
	};

	await test.step("フォームに入力", async () => {
		await registerCustomerPage.getByLabel("名前").fill(testData.name);
		await registerCustomerPage
			.getByLabel("メールアドレス")
			.fill(testData.email);
		await registerCustomerPage
			.getByLabel("電話番号（任意）")
			.fill(testData.phone);
	});

	await test.step("登録ボタンをクリック", async () => {
		await registerCustomerPage
			.getByRole("button", { name: "登録する" })
			.click();
	});

	await test.step("詳細ページに遷移することを確認", async () => {
		await registerCustomerPage.waitForURL("**/customers/*");
		await expect(registerCustomerPage.getByText("顧客詳細")).toBeVisible();
	});

	await test.step("登録した情報が表示されることを確認", async () => {
		await expect(registerCustomerPage.getByText(testData.name)).toBeVisible();
		await expect(registerCustomerPage.getByText(testData.email)).toBeVisible();
		await expect(registerCustomerPage.getByText(testData.phone)).toBeVisible();
	});
});

test("電話番号なしで顧客を登録できる", async ({ registerCustomerPage }) => {
	const uniqueId = Date.now();
	const testData = {
		email: `e2e-test-no-phone-${uniqueId}@example.com`,
		name: `E2Eテスト花子_${uniqueId}`,
	};

	await test.step("名前とメールアドレスのみ入力", async () => {
		await registerCustomerPage.getByLabel("名前").fill(testData.name);
		await registerCustomerPage
			.getByLabel("メールアドレス")
			.fill(testData.email);
	});

	await test.step("登録ボタンをクリック", async () => {
		await registerCustomerPage
			.getByRole("button", { name: "登録する" })
			.click();
	});

	await test.step("詳細ページに遷移することを確認", async () => {
		await registerCustomerPage.waitForURL("**/customers/*");
		await expect(registerCustomerPage.getByText("顧客詳細")).toBeVisible();
	});

	await test.step("登録した情報が表示されることを確認", async () => {
		await expect(registerCustomerPage.getByText(testData.name)).toBeVisible();
		await expect(registerCustomerPage.getByText(testData.email)).toBeVisible();
		// 電話番号は表示されない
		await expect(registerCustomerPage.getByText("電話番号")).not.toBeVisible();
	});
});

test("必須フィールドが空の場合、バリデーションエラーが表示される", async ({
	registerCustomerPage,
}) => {
	await test.step("フォームを空のまま送信", async () => {
		await registerCustomerPage
			.getByRole("button", { name: "登録する" })
			.click();
	});

	await test.step("バリデーションエラーが表示されることを確認", async () => {
		await expect(
			registerCustomerPage.getByText("名前を入力してください"),
		).toBeVisible();
		await expect(
			registerCustomerPage.getByText("メールアドレスを入力してください"),
		).toBeVisible();
	});

	await test.step("ページ遷移していないことを確認", async () => {
		expect(registerCustomerPage.url()).toContain("/customers/new");
	});
});

test("不正なメールアドレス形式の場合、バリデーションエラーが表示される", async ({
	registerCustomerPage,
}) => {
	await test.step("不正な形式のメールアドレスを入力", async () => {
		await registerCustomerPage.getByLabel("名前").fill("テスト太郎");
		await registerCustomerPage
			.getByLabel("メールアドレス")
			.fill("invalid-email");
	});

	await test.step("登録ボタンをクリック", async () => {
		await registerCustomerPage
			.getByRole("button", { name: "登録する" })
			.click();
	});

	await test.step("バリデーションエラーが表示されることを確認", async () => {
		await expect(
			registerCustomerPage.getByText(
				"正しいメールアドレス形式で入力してください",
			),
		).toBeVisible();
	});
});

test("既に登録済みのメールアドレスの場合、エラーメッセージが表示される", async ({
	registerCustomerPage,
}) => {
	// seedデータの既存メールアドレスを使用
	const existingEmail = "test1@example.com";

	await test.step("既存のメールアドレスで登録を試みる", async () => {
		await registerCustomerPage.getByLabel("名前").fill("重複テスト");
		await registerCustomerPage.getByLabel("メールアドレス").fill(existingEmail);
	});

	await test.step("登録ボタンをクリック", async () => {
		await registerCustomerPage
			.getByRole("button", { name: "登録する" })
			.click();
	});

	await test.step("エラーメッセージが表示されることを確認", async () => {
		await expect(
			registerCustomerPage.getByText(
				"このメールアドレスは既に登録されています",
			),
		).toBeVisible();
	});

	await test.step("ページ遷移していないことを確認", async () => {
		expect(registerCustomerPage.url()).toContain("/customers/new");
	});
});

test("送信中はボタンが無効化され、ローディング表示になる", async ({
	registerCustomerPage,
}) => {
	const uniqueId = Date.now();
	const testData = {
		email: `e2e-test-loading-${uniqueId}@example.com`,
		name: `E2Eテスト_Loading_${uniqueId}`,
	};

	await test.step("フォームに入力", async () => {
		await registerCustomerPage.getByLabel("名前").fill(testData.name);
		await registerCustomerPage
			.getByLabel("メールアドレス")
			.fill(testData.email);
	});

	await test.step("登録ボタンをクリック", async () => {
		await registerCustomerPage
			.getByRole("button", { name: "登録する" })
			.click();
	});

	await test.step("ローディング状態を確認", async () => {
		// ローディング中のボタンが表示される
		const loadingButton = registerCustomerPage.getByRole("button", {
			name: /登録中/,
		});
		// ローディングボタンが表示されている間は無効化されている
		await expect(loadingButton).toBeDisabled();
	});

	await test.step("登録完了後、詳細ページに遷移することを確認", async () => {
		await registerCustomerPage.waitForURL("**/customers/*");
		await expect(registerCustomerPage.getByText("顧客詳細")).toBeVisible();
	});
});
