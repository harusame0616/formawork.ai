import { randomUUID } from "node:crypto";
import { test as base, expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";

type CustomersPageFixture = {
	customersPage: Page;
	authenticatedPage: Page;
	testUser: {
		email: string;
		password: string;
	};
	searchPaginationCustomers: {
		keyword: string;
		count: number;
	};
};

const test = base.extend<CustomersPageFixture>({
	authenticatedPage: async ({ page, testUser }, use) => {
		// ログイン処理
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");

		await use(page);
	},
	customersPage: async ({ authenticatedPage }, use) => {
		// 顧客一覧ページに遷移
		await authenticatedPage.goto("/customers");
		await authenticatedPage.waitForURL("/customers");
		await expect(
			authenticatedPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();

		await use(authenticatedPage);
	},
	// biome-ignore lint/correctness/noEmptyPattern: fixtureの引数はオブジェクト分割が必要
	searchPaginationCustomers: async ({}, use) => {
		const keyword = randomUUID().slice(0, 8);
		const count = 40;
		const customers = Array.from({ length: count }, (_, i) => ({
			customerId: randomUUID(),
			email: `${keyword}-${i}@example.com`,
			firstName: keyword,
			lastName: `テスト${i}`,
			phone: `0900000${String(i).padStart(4, "0")}`,
		}));

		await db.insert(customersTable).values(customers);

		await use({ count, keyword });

		// クリーンアップ
		await db
			.delete(customersTable)
			.where(eq(customersTable.firstName, keyword));
	},
	testUser: [
		{
			email: "test1@example.com",
			password: "Test@Pass123",
		},
		{ option: true },
	],
});

test("メニューから顧客一覧ページに遷移できる", async ({
	authenticatedPage,
}) => {
	await test.step("メニューボタンをクリックしてメニューを開く", async () => {
		await authenticatedPage
			.getByRole("button", { name: /^メニューを開く$/ })
			.click();
	});

	await test.step("顧客一覧リンクをクリック", async () => {
		await authenticatedPage.getByRole("link", { name: "顧客一覧" }).click();
	});

	await test.step("顧客一覧ページに遷移することを確認", async () => {
		await expect(authenticatedPage).toHaveURL("/customers");
		await expect(
			authenticatedPage.getByRole("heading", { name: "顧客一覧" }),
		).toBeVisible();
	});
});

test("名前で検索できる", async ({ customersPage }) => {
	const searchKeyword = "太郎";

	await test.step("名前を入力して検索", async () => {
		await customersPage.getByLabel("キーワード").fill(searchKeyword);
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL("**/customers?keyword=*");
		await expect(
			customersPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果を確認", async () => {
		// 表示されている全てのデータがキーワードを含んでいることを確認
		const rows = customersPage.locator("table tbody tr");
		const count = await rows.count();
		for (let i = 0; i < count; i++) {
			const row = rows.nth(i);
			const text = await row.textContent();
			expect(text).toContain(searchKeyword);
		}
	});
});

test("メールアドレスで検索できる", async ({ customersPage }) => {
	const searchKeyword = "admin";

	await test.step("メールアドレスで検索", async () => {
		await customersPage.getByLabel("キーワード").fill(searchKeyword);
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL("**/customers?keyword=*");
		await expect(
			customersPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果を確認", async () => {
		// 表示されている全てのデータがキーワードを含んでいることを確認
		const rows = customersPage.locator("table tbody tr");
		const count = await rows.count();
		for (let i = 0; i < count; i++) {
			const row = rows.nth(i);
			const text = await row.textContent();
			expect(text).toContain(searchKeyword);
		}
	});
});

test("該当する顧客がいない場合、メッセージが表示される", async ({
	customersPage,
}) => {
	await test.step("存在しないキーワードで検索", async () => {
		await customersPage.getByLabel("キーワード").fill("存在しない顧客");
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL("**/customers?keyword=*");
		await expect(
			customersPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("メッセージを確認", async () => {
		await expect(
			customersPage.getByText("顧客が見つかりませんでした"),
		).toBeVisible();
	});
});

test("ページネーションが正しく動作する", async ({ customersPage }) => {
	await test.step("1ページ目に20件表示されることを確認", async () => {
		await expect(
			customersPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
		// seedデータは20件以上あるため、他のテストで変更があったとしても 20 件はあることを前提とする
		const rows = customersPage.locator("table tbody tr");
		await expect(rows).toHaveCount(20);
	});

	await test.step("2ページ目をクリック", async () => {
		await customersPage.getByRole("link", { name: /^2$/ }).click();
	});

	await test.step("2ページ目に遷移することを確認", async () => {
		// データは作成系のテストによって変わってしまうので URL が正しいことのみチェック
		// 正しいデータが取得できるかは server の medium テストで担保
		await expect(customersPage).toHaveURL("/customers?page=2");
	});

	await test.step("「前へ」ボタンで1ページ目に戻れることを確認", async () => {
		await customersPage.getByRole("link", { name: "前へ" }).click();
		await customersPage.waitForURL("/customers?page=1");
		const rows = customersPage.locator("table tbody tr");
		await expect(rows).toHaveCount(20);
	});
});

test("検索とページネーションを組み合わせて使用できる", async ({
	customersPage,
	searchPaginationCustomers,
}) => {
	const { keyword } = searchPaginationCustomers;

	await test.step("キーワードで検索して1ページ目を表示", async () => {
		await customersPage.getByLabel("キーワード").fill(keyword);
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL(`**/customers?keyword=${keyword}`);
		await expect(
			customersPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();

		// 1ページ目に20件表示されることを確認
		const rows = customersPage.locator("table tbody tr");
		await expect(rows).toHaveCount(20);

		// 表示されている全てのデータがキーワードを含んでいることを確認
		for (let i = 0; i < 20; i++) {
			const row = rows.nth(i);
			const text = await row.textContent();
			expect(text).toContain(keyword);
		}
	});

	await test.step("2ページ目に遷移", async () => {
		await customersPage.getByRole("link", { name: /^2$/ }).click();
		await customersPage.waitForURL(`**/customers?keyword=${keyword}&page=2`);
		await expect(
			customersPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();

		// 2ページ目に残り20件が表示されることを確認
		const rows = customersPage.locator("table tbody tr");
		await expect(rows).toHaveCount(20);

		// キーワードが保持されていることを確認
		const searchInput = customersPage.getByLabel("キーワード");
		await expect(searchInput).toHaveValue(keyword);
	});

	await test.step("「前へ」ボタンで1ページ目に戻れることを確認", async () => {
		await customersPage.getByRole("link", { name: "前へ" }).click();
		await customersPage.waitForURL(`**/customers?keyword=${keyword}&page=1`);
		await expect(
			customersPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();

		const rows = customersPage.locator("table tbody tr");
		await expect(rows).toHaveCount(20);

		// キーワードが保持されていることを確認
		const searchInput = customersPage.getByLabel("キーワード");
		await expect(searchInput).toHaveValue(keyword);
	});
});
