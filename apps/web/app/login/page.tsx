import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import Link from "next/link";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									placeholder="m@example.com"
									required
									type="email"
								/>
							</div>
							<div className="grid gap-2">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
									<Link
										className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
										href="/forgot-password"
									>
										Forgot your password?
									</Link>
								</div>
								<Input id="password" required type="password" />
							</div>
							<Button className="w-full" type="submit">
								Login
							</Button>
						</div>
						<div className="mt-4 text-center text-sm">
							Don't have an account?{" "}
							<Link className="underline underline-offset-4" href="/signup">
								Sign up
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
