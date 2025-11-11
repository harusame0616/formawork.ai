import { v7 as uuidv7 } from "uuid";

export function generateUniqueId(): string {
	return uuidv7();
}
