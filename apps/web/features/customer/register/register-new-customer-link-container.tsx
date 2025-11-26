import Link from "next/link";
import { getUserRole, UserRole } from "@/features/auth/get-user-role";

export async function RegisterNewCustomerLinkContainer() {
	const role = await getUserRole();

	if (role !== UserRole.Admin) {
		return null;
	}

	return (
		<Link className="text-primary underline" href="/customers/new">
			新規登録
		</Link>
	);
}
