# ロギング実装ガイドライン

すべてのログ出力には `@repo/logger` パッケージを使用すること（OWASP Logging Cheat Sheet 準拠）。

## 基本原則

- **Next.js Server Component/Server Action**: `@repo/logger/nextjs/server` から `getLogger()` を使用（IP アドレスとリクエストIDを自動取得）
- **Next.js Route Handler**: `getBaseLogger()` を使用し、`request` オブジェクトから IP アドレスとリクエストIDを取得
- **Next.js Middleware**: リクエストIDを自動生成するため middleware を設定すること（推奨）
- **その他の環境**: `getBaseLogger()` を使用
- `application`、`environment`、`service` は環境変数から自動取得
- 動的なコンテキスト（userId など）は `logger.child()` で追加すること
- 機密情報（パスワード、トークン、キーなど）は自動的にマスキングされるが、意図的に含めないこと

## 環境変数（必須）

- `APP_NAME`: アプリケーション名
- `HOST_ENVIRONMENT`: ホスト環境（development/staging/production）
- `SERVICE_NAME`: サービス名（web/api/db など）

## ログレベルの使い分け

| レベル | 用途 | 通知 |
|--------|------|------|
| `fatal` | 全体に影響する深刻なエラー。サービスの正常な動作を阻害 | ✓ |
| `error` | 特定の操作に影響する重要なエラー。早急な対応が必要 | ✓ |
| `warn` | 注意が必要な事象や潜在的な問題。サービスの正常な動作には影響しない | |
| `info` | サービスの正常な流れや重要なイベント | |
| `debug` | 開発やデバッグ用の詳細情報（本番環境では通常無効化） | |
| `trace` | 非常に詳細な処理ステップ（本番環境では無効化） | |

## 通知ポリシー

- ERROR レベル以上（ERROR, FATAL）は通知対象
- 通知は observability サービス（監視ツール）によって行われる
- アプリケーションレベルでは通知を行わない

## 記録必須のセキュリティイベント（OWASP 推奨）

- **認証・認可**: ログイン成功/失敗、アクセス拒否、パスワードリセット
- **データ操作**: CRUD 操作（特に削除・更新）、ユーザー管理操作、管理者権限での操作
- **入力検証**: バリデーション失敗、不正なファイルアップロード試行
- **セッション管理**: Cookie 値の変更、JWT 検証の失敗
- **システムイベント**: 起動/停止、設定変更、外部 API 呼び出し

## ログに含めるべき情報

- **必須**: タイムスタンプ、ログレベル、メッセージ、アプリケーション名、環境、サービス名
- **推奨**: ユーザー ID、IP アドレス、リクエスト ID、アクション種別、影響を受けたリソース

## 絶対に記録してはいけない情報

- パスワード、API トークン、暗号化キー
- 支払いカード情報、銀行口座情報
- セッション ID（必要な場合はハッシュ化）
- 機密な個人情報（PII）

## Middleware設定（Next.js）

Next.js Middleware でロギングに必要なヘッダーを自動設定すること。

設定すべきヘッダー：
- `x-request-id`: リクエストトレーシング用のUUID（必須）
- `x-git-commit-sha`: Gitコミットハッシュ（Vercel環境変数 `VERCEL_GIT_COMMIT_SHA` から取得）
- `x-deployment-id`: デプロイID（Vercel環境変数 `VERCEL_DEPLOYMENT_ID` から取得）
- `x-auth-user-id`: 認証ユーザーID（Supabase認証から取得）

## 使用例

```typescript
// Next.js Server Component/Server Action
import { getLogger } from "@repo/logger/nextjs/server";

export async function loginAction(formData: FormData) {
  const logger = await getLogger(); // IPアドレスとリクエストIDを自動取得
  logger.info({ userId, action: "login" }, "User logged in successfully");
}

// Next.js Route Handler
import { getBaseLogger } from "@repo/logger";

export async function POST(request: Request) {
  const logger = getBaseLogger({});

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim();
  const requestId = request.headers.get("x-request-id");

  const requestLogger = logger.child({
    requestId,
    ipAddress,
  });

  requestLogger.info("Processing request");
}

// その他の環境
import { getBaseLogger } from "@repo/logger";

const logger = getBaseLogger({});
logger.error({ err }, "Authentication failed");
```

詳細は [packages/logger/README.md](packages/logger/README.md) を参照。
