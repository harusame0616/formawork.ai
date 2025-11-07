import { createClient } from "@repo/supabase/nextjs/server";
import { cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCustomers } from "../../features/customer/get-customers";
import { CustomersPresenter } from "./customers-presenter";

export const TAG_CUSTOMER = "customer";

type CustomersContainerProps = {
	keyword?: string;
	page?: string;
};

export async function CustomersContainer({
	keyword,
	page,
}: CustomersContainerProps) {
	"use cache: remote";
	cacheTag(TAG_CUSTOMER);

	// Authentication check
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// Fetch customers data
	const pageNumber = page ? Number.parseInt(page, 10) : 1;
	const data = await getCustomers({
		keyword,
		page: pageNumber,
		pageSize: 20,
	});

	return <CustomersPresenter data={data} keyword={keyword} />;
}
