# Next.js 実装ルール

## Server Component First

- Server Component での実装を最優先とし、ユーザーのインタラクションが必要な場合にのみクライアントコンポーネントを採用すること
- データの取得は極力末端で行い、上位からバケツリレーで下位に渡すことを避けること

## Server Action

- データのミューテーションには Server Action を使用すること
- Server Action ではカバーできないことや、クライアントからのデータフェッチ用 API には Route Handler を使用すること
- Server Component で利用するデータ取得には使用しないこと
- Server Action はシンタックスシュガーであり、本質的には API と変わらず自由なパラメータで呼び出せるため、引き数がある場合は必ずバリデーションと適切な認証、認可を実施する

## Route Handler

- データフェッチなどのミューテーションを伴わないサーバー操作に使用すること
- cron 用の API など外部から利用されることを想定した API に使用すること

## Container / Presenter / Custom Hook

### Server Component
データ取得やロジックは Container / Presenter パターンとして分離すること。

```tsx
async function FooContainer({ id }: { id: string }) {
  const foo = await getFoo(id);
  return <FooPresenter foo={foo} />;
}
```

### Client Component
データ取得やロジックを分離する場合は Custom Hook として分離すること。

```tsx
function Foo({ id }: { id: string }) {
  const { foo } = useFoo(id);
  return <div>{foo.bar}</div>;
}
```
