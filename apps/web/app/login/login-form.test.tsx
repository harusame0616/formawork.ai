import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { LoginForm } from "./login-form";

it("フォームが正しくレンダリングされること", () => {
	render(<LoginForm />);

	// メールアドレスフィールドが存在すること
	expect(
		screen.getByRole("textbox", { name: /メールアドレス/i }),
	).toBeInTheDocument();
	// パスワードフィールドが存在すること
	expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
	// ログインボタンが存在すること
	expect(screen.getByRole("button", { name: /ログイン/ })).toBeInTheDocument();
});
