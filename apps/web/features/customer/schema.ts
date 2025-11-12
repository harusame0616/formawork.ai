import * as v from "valibot";

// 検索キーワードの最大文字数
export const CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH = 300;

// SearchParams を適切な方に変換のみ
export const customerSearchParamsSchema = v.object({
	keyword: v.optional(v.pipe(v.string())),
	page: v.optional(v.pipe(v.string(), v.regex(/\d+/), v.transform(Number))),
});

// 内部処理用のschema（パース済みのデータ）
const customerSearchConditionSchema = v.object({
	keyword: v.optional(
		v.pipe(v.string(), v.maxLength(CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH)),
	),
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
});

export type CustomerSearchConditionInput = v.InferInput<
	typeof customerSearchConditionSchema
>;

// 顧客登録用の定数
const CUSTOMER_NAME_MAX_LENGTH = 24;
const CUSTOMER_EMAIL_MAX_LENGTH = 254;
const CUSTOMER_PHONE_MAX_LENGTH = 20;

// 顧客登録用のスキーマ
export const registerCustomerSchema = v.object({
	email: v.union([
		v.literal(""),
		v.pipe(
			v.string(),
			v.email("正しいメールアドレス形式で入力してください"),
			v.maxLength(
				CUSTOMER_EMAIL_MAX_LENGTH,
				`メールアドレスは${CUSTOMER_EMAIL_MAX_LENGTH}文字以内で入力してください`,
			),
		),
	]),
	name: v.union([
		v.literal(""),
		v.pipe(
			v.string("名前を入力してください"),
			v.minLength(1, "名前を入力してください"),
			v.maxLength(
				CUSTOMER_NAME_MAX_LENGTH,
				`名前は${CUSTOMER_NAME_MAX_LENGTH}文字以内で入力してください`,
			),
		),
	]),
	phone: v.union([
		v.literal(""),
		v.pipe(
			v.string(),
			v.transform((value) => value.replace(/-/g, "")),
			v.regex(/^\d*$/, "電話番号は数字のみで入力してください"),
			v.maxLength(
				CUSTOMER_PHONE_MAX_LENGTH,
				`電話番号は${CUSTOMER_PHONE_MAX_LENGTH}文字以内で入力してください`,
			),
		),
	]),
});

export type RegisterCustomerInput = v.InferInput<typeof registerCustomerSchema>;
