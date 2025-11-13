export const CustomerTag = {
	crud: "CUSTOMER_TAG_CRUD",
};

// @knip-ignore - Used in get-customer-detail.ts (not in this PR)
export function tagByCustomerId(customerId: string) {
	return `CUSTOMER_TAG_${customerId}`;
}
