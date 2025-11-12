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

test("全フィールドを境界値一杯で入力して顧客を登録し、詳細ページへ遷移する", async ({
	registerCustomerPage,
}) => {
	// 境界値一杯のテストデータ
	const testData = {
		// メールアドレス: 254文字（最大値）
		// ローカル部分64文字 + @ + ドメイン部分189文字 = 254文字
		email: `${"a".repeat(64)}@${"example-".repeat(22)}example12.com`,
		// 名前: 24文字（最大値）
		name: "あいうえおかきくけこさしすせそたちつてとなにぬね",
		// 電話番号: ハイフン込みで入力（ハイフンを除いて20文字分の数字）
		phone: "012-3456-7890-123456789",
	};

	await test.step("フォームに境界値一杯のデータを入力", async () => {
		await registerCustomerPage.getByLabel("名前").fill(testData.name);
		await registerCustomerPage
			.getByLabel("メールアドレス")
			.fill(testData.email);
		await registerCustomerPage.getByLabel("電話番号").fill(testData.phone);
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

	await test.step("登録した情報が正しく表示されることを確認", async () => {
		// 名前の確認（font-boldクラスで表示される通常のテキスト）
		const nameSection = registerCustomerPage
			.getByText("名前")
			.locator("..")
			.locator("..");
		await expect(nameSection.getByText(testData.name)).toBeVisible();

		// メールアドレスの確認（リンクとして表示される）
		const emailLink = registerCustomerPage.getByRole("link", {
			name: testData.email,
		});
		await expect(emailLink).toBeVisible();
		await expect(emailLink).toHaveAttribute("href", `mailto:${testData.email}`);

		// 電話番号の確認（ハイフンが削除された状態でリンクとして表示される）
		const expectedPhone = testData.phone.replace(/-/g, "");
		const phoneLink = registerCustomerPage.getByRole("link", {
			name: expectedPhone,
		});
		await expect(phoneLink).toBeVisible();
		await expect(phoneLink).toHaveAttribute("href", `tel:${expectedPhone}`);

		// 作成日時と更新日時は medium テストとコンポーネントテストで担保
	});
});

test("必須フィールドのみ入力して登録でき、詳細ページへ遷移する", async ({
	registerCustomerPage,
}) => {
	const uniqueId = Date.now();
	const testData = {
		name: `必須のみ登録テスト_${uniqueId}`,
	};

	await test.step("必須フィールド（名前）のみ入力", async () => {
		await registerCustomerPage.getByLabel("名前").fill(testData.name);
		// メールアドレスと電話番号は入力しない
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

	await test.step("登録した情報が正しく表示されることを確認", async () => {
		// 名前の確認（font-boldクラスで表示される通常のテキスト）
		const nameSection = registerCustomerPage
			.getByText("名前")
			.locator("..")
			.locator("..");
		await expect(nameSection.getByText(testData.name)).toBeVisible();

		// メールアドレスと電話番号は「未登録」と表示される
		const emailLabel = registerCustomerPage
			.getByText("メールアドレス")
			.locator("..");
		await expect(emailLabel.getByText("未登録")).toBeVisible();

		const phoneLabel = registerCustomerPage.getByText("電話番号").locator("..");
		await expect(phoneLabel.getByText("未登録")).toBeVisible();

		// 作成日時と更新日時は medium テストとコンポーネントテストで担保
	});
});
