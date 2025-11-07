import path from "node:path";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	optimizeDeps: {
		include: [
			"@testing-library/react",
			"@testing-library/user-event",
			"@testing-library/jest-dom/vitest",
		],
	},
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
	test: {
		browser: {
			enabled: true,
			headless: true,
			instances: [
				{
					browser: "chromium",
				},
			],
			provider: playwright(),
		},
		exclude: ["**/e2e/**", "**/node_modules/**", "**/dist/**"],
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
	},
});
