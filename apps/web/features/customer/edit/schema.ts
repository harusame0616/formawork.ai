import * as v from "valibot";
import {
	emailSchema,
	firstNameSchema,
	lastNameSchema,
	phoneSchema,
} from "../schema";

export const editCustomerSchema = v.object({
	customerId: v.pipe(v.string(), v.uuid()),
	email: emailSchema,
	firstName: firstNameSchema,
	lastName: lastNameSchema,
	phone: phoneSchema,
});

export type EditCustomerParams = v.InferInput<typeof editCustomerSchema>;
