"use server";

import { fail, type Result, succeed } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { customerNotesTable } from "@workspace/db/schema/customer-note";
import { updateTag } from "next/cache";
import * as v from "valibot";
import { getUserStaffId } from "../../../lib/auth/get-user-staff-id";
import { CustomerTag } from "../tag";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const UNAUTHORIZED_ERROR_MESSAGE = "認証に失敗しました" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type RegisterCustomerNoteActionErrorMessage =
	| typeof INVALID_INPUT_ERROR_MESSAGE
	| typeof UNAUTHORIZED_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

const registerCustomerNoteSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(1, "内容を入力してください"),
		v.maxLength(4096, "内容は4096文字以内で入力してください"),
	),
	customerId: v.pipe(v.string(), v.uuid()),
});

type RegisterCustomerNoteInput = v.InferInput<
	typeof registerCustomerNoteSchema
>;

export async function registerCustomerNoteAction(
	params: RegisterCustomerNoteInput,
): Promise<Result<undefined, RegisterCustomerNoteActionErrorMessage>> {
	const logger = await getLogger("registerCustomerNoteAction");
	logger.info("execute registerCustomerNoteAction", {
		params,
	});

	// バリデーション
	const paramsParseResult = v.safeParse(registerCustomerNoteSchema, params);
	if (!paramsParseResult.success) {
		logger.warn("Validation failed", {
			event: EventType.InputValidationError,
			issues: paramsParseResult.issues,
		});
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	const { content, customerId } = paramsParseResult.output;

	// 認証情報の取得
	const staffId = await getUserStaffId();
	if (!staffId) {
		logger.warn("Unauthorized access", {
			event: EventType.AuthenticationFailure,
		});
		return fail(UNAUTHORIZED_ERROR_MESSAGE);
	}

	try {
		// 顧客ノートの登録
		await db.insert(customerNotesTable).values({
			content,
			customerId,
			staffId,
		});

		logger.info("Customer note registered successfully", {
			action: "register-customer-note",
			customerId,
		});

		updateTag(CustomerTag.NoteCrud(customerId));
	} catch (error) {
		logger.error("Failed to register customer note", {
			action: "register-customer-note",
			err: error,
		});
		return fail(INTERNAL_SERVER_ERROR_MESSAGE);
	}

	return succeed();
}
