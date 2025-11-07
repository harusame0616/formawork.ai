import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const customersTable = pgTable("customers", {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	customerId: uuid("customer_id").primaryKey().defaultRandom(),
	email: text("email").notNull().unique(),
	name: text("name").notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SelectCustomer = typeof customersTable.$inferSelect;
export type InsertCustomer = typeof customersTable.$inferInsert;
