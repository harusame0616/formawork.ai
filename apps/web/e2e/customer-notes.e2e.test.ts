import { test as base, expect, type Page } from "@playwright/test";

type CustomerNotesPageFixture = {
	customerNotesPage: Page;
	testUser: { email: string; password: string };
	testCustomerId: string;
};

const test = base.extend<CustomerNotesPageFixture>({
	customerNotesPage: async ({ page }, use) => {
		const customerId = "00000000-0000-0000-0000-000000000001";
		const testUser = {
			email: "test1@example.com",
			password: "Test@Pass123",
		};

		// ログイン
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");

		// 顧客ノート一覧ページへ遷移
		await page.goto(`/customers/${customerId}/notes`);
		await page.waitForURL(`/customers/${customerId}/notes`);
		await expect(page.getByText("読み込み中")).toBeHidden();

		await use(page);
	},
});

test("正常系: 1文字（最小境界値）のノート登録成功", async ({
	customerNotesPage,
}) => {
	const noteContent = "¥";

	await test.step("ノート追加ダイアログを開く", async () => {
		await customerNotesPage
			.getByRole("button", { name: "ノートを追加" })
			.click();
		await expect(
			customerNotesPage.getByRole("dialog").getByText("ノートを追加"),
		).toBeVisible();
	});

	await test.step("1文字のノート内容を入力", async () => {
		await customerNotesPage.getByLabel("内容").fill(noteContent);
	});

	await test.step("ノートを登録", async () => {
		await customerNotesPage
			.getByRole("dialog")
			.getByRole("button", { name: "登録" })
			.click();
	});

	await test.step("登録結果を確認", async () => {
		// ダイアログが閉じることを確認
		await expect(customerNotesPage.getByRole("dialog")).toBeHidden();

		// 登録したノートが一覧に表示されることを確認
		await expect(customerNotesPage.getByText(noteContent)).toBeVisible();
	});
});

test("正常系: 4096文字（最大境界値）のノート登録成功", async ({
	customerNotesPage,
}) => {
	const noteContent = "あ".repeat(4096);

	await test.step("ノート追加ダイアログを開く", async () => {
		await customerNotesPage
			.getByRole("button", { name: "ノートを追加" })
			.click();
		await expect(
			customerNotesPage.getByRole("dialog").getByText("ノートを追加"),
		).toBeVisible();
	});

	await test.step("4096文字のノート内容を入力", async () => {
		await customerNotesPage.getByLabel("内容").fill(noteContent);
	});

	await test.step("ノートを登録", async () => {
		await customerNotesPage
			.getByRole("dialog")
			.getByRole("button", { name: "登録" })
			.click();
	});

	await test.step("登録結果を確認", async () => {
		// ダイアログが閉じることを確認
		await expect(customerNotesPage.getByRole("dialog")).toBeHidden();

		// 登録したノートが一覧に表示されることを確認
		await expect(customerNotesPage.getByText(noteContent)).toBeVisible();
	});
});
