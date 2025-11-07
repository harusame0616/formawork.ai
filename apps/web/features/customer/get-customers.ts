import { db } from "@workspace/db/client";
import { customersTable, type SelectCustomer } from "@workspace/db/schema";
import { count, ilike, or } from "drizzle-orm";

export type GetCustomersParams = {
	keyword?: string;
	page?: number;
	pageSize?: number;
};

export type GetCustomersResult = {
	customers: SelectCustomer[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export async function getCustomers(
	params: GetCustomersParams = {},
): Promise<GetCustomersResult> {
	const { keyword, page = 1, pageSize = 20 } = params;

	// Build where clause
	const whereConditions = keyword
		? or(
				ilike(customersTable.name, `%${keyword}%`),
				ilike(customersTable.email, `%${keyword}%`),
			)
		: undefined;

	// Get total count
	const [{ value: total }] = await db
		.select({ value: count() })
		.from(customersTable)
		.where(whereConditions);

	// Get paginated customers
	const customers = await db
		.select()
		.from(customersTable)
		.where(whereConditions)
		.orderBy(customersTable.createdAt)
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	const totalPages = Math.ceil(total / pageSize);

	return {
		customers,
		page,
		pageSize,
		total,
		totalPages,
	};
}
