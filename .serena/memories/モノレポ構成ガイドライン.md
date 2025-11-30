# モノレポ構成ガイドライン

## パッケージ実装方針

- 各モノレポパッケージでは JIT パッケージとして実装し、使用する側でビルド時にコンパイルすること

## パッケージ構成

| パッケージ | 説明 |
|-----------|------|
| `apps/web` | Next.js Web アプリケーション |
| `packages/db` | Drizzle ORM スキーマとデータベースクライアント |
| `packages/ui` | shadcn/ui コンポーネント |
| `packages/logger` | pino ベースのロガー |
| `packages/supabase` | Supabase 設定 |
| `packages/tsconfig` | 共通 TypeScript 設定 |

## 依存関係の参照方法

- ワークスペースパッケージ: `"workspace:"` プレフィックスを使用
- カタログバージョン: `"catalog:"` プレフィックスを使用（pnpm-workspace.yaml で一元管理）

```json
{
  "dependencies": {
    "@workspace/ui": "workspace:",
    "next": "catalog:"
  }
}
```
