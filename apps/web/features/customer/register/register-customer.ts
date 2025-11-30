import { type Success, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { generateUniqueId } from "@/libs/generate-unique-id";
import type { RegisterCustomerParams } from "./schema";

export async function registerCustomer({
	firstName,
	lastName,
	email,
	phone,
}: RegisterCustomerParams): Promise<Success<{ customerId: string }>> {
	const customerId = generateUniqueId();

	await db.insert(customersTable).values({
		customerId,
		email,
		firstName,
		lastName,
		phone,
	});

	return succeed({ customerId });
}
