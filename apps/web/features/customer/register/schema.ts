import * as v from "valibot";
import {
	emailSchema,
	firstNameSchema,
	lastNameSchema,
	phoneSchema,
} from "../schema";

export const registerCustomerSchema = v.object({
	email: emailSchema,
	firstName: firstNameSchema,
	lastName: lastNameSchema,
	phone: phoneSchema,
});

export type RegisterCustomerParams = v.InferOutput<
	typeof registerCustomerSchema
>;
