export const CustomerTag = {
	crud: "CUSTOMER_TAG_CRUD",
};
export function tagByCustomerId(customerId: string) {
	return `CUSTOMER_TAG_${customerId}`;
}
