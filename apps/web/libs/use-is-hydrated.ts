import { useSyncExternalStore } from "react";

/**
 * ハイドレーション完了を検知するためのフック
 *
 * useSyncExternalStoreを使用する理由:
 * - サーバーとクライアントで異なる値を安全に扱える設計
 * - React 18以降でハイドレーション状態を扱う推奨パターン
 * - StrictModeでの安定性が高い
 * - 値が変更されない外部状態(ブラウザ環境)の場合、空のsubscribe関数は正当な使用法
 */
export function useIsHydrated() {
	const isHydrated = useSyncExternalStore(
		// subscribe: 値が変更されないため空の関数を返す
		() => () => {},
		// getSnapshot: クライアント側では常にtrue
		() => true,
		// getServerSnapshot: サーバー側では常にfalse
		() => false,
	);

	return { isHydrated };
}
