import { vi } from "vitest";

// next/navigation のモック
vi.mock("next/navigation", () => ({
	usePathname: vi.fn().mockReturnValue("/"),
	useRouter: vi.fn().mockReturnValue({
		back: vi.fn(),
		forward: vi.fn(),
		prefetch: vi.fn(),
		push: vi.fn(),
		refresh: vi.fn(),
		replace: vi.fn(),
	}),
	useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

globalThis.process = {
	env: {
		NODE_ENV: "test",
	},
	// biome-ignore lint/suspicious/noExplicitAny: process.env がないと next/link でエラーが出るため暫定対応
} as any;
