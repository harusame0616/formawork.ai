import "@testing-library/jest-dom/vitest";

// Polyfill process for browser mode
if (typeof window !== "undefined" && typeof process === "undefined") {
	(
		globalThis as typeof globalThis & {
			process: { env: { NODE_ENV: string } };
		}
	).process = {
		env: { NODE_ENV: "test" },
	};
}
