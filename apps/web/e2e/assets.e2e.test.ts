import { expect, test } from "@playwright/test";

const staticAssets = [
	"/favicon.ico",
	"/manifest.webmanifest",
	"/icon-192x192.png",
	"/icon-512x512.png",
	"/apple-icon.png",
];

for (const asset of staticAssets) {
	test(`${asset} に認証なしでアクセスできる`, async ({ request }) => {
		const response = await request.get(asset);
		expect(response.status()).toBe(200);
	});
}
