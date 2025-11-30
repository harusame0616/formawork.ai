# Next.js Page / Layout ガイドライン

## Page と Layout の型定義

Page と Layout では Next.js が提供する型ヘルパーを使用すること。

### Page コンポーネント
- `PageProps<ルートリテラル>` を使用すること
- ルートリテラルにより `params` と `searchParams` が型安全になる
- グローバルに利用可能でインポート不要

### Layout コンポーネント
- `LayoutProps<ルートリテラル>` を使用すること
- `children` と `params` が型安全になる
- グローバルに利用可能でインポート不要

### params と searchParams の扱い
- Page/Layout で `params` や `searchParams` を `await` すると、そのコンポーネントが Dynamic になってしまう
- **必要がなければ** `await` を避け、`.then()` で変換して子コンポーネントに Promise として渡すこと
- `.then()` 内でデストラクチャリングを使用してシンプルに記述すること
- `searchParams` は `.then()` 内で必ず valibot でパースすること（型の保証だけでは不十分）
- クライアントコンポーネントなど、値が必要な場合は `await` して使用すること（この場合は Dynamic になることを理解する）

```tsx
// params の例
async function Page({ params }: PageProps<"/customers/[customerId]">) {
  const customerIdPromise = params.then(({ customerId }) => customerId);
  return <CustomerContainer customerIdPromise={customerIdPromise} />;
}

// searchParams の例
async function Page({ searchParams }: PageProps<"/customers">) {
  const parsedSearchParamsPromise = searchParams.then((searchParams) =>
    parse(searchParamsSchema, searchParams)
  );
  return <Customers condition={parsedSearchParamsPromise} />;
}
```

## Suspense とローディング状態

### Container 配置時の必須対応
- Container コンポーネント（async component）を配置する際は、**Page コンポーネント側で必ず** `Suspense` でラップすること
- Container 自体に Suspense を配置してはいけない（Page で配置する）
  - **例外**: Container 内で別の Container や非同期コンポーネントをネストする場合は、Container 内で Suspense を配置すること
- `fallback` には専用のスケルトンコンポーネントを指定すること
- スケルトンはロード後のデザインと一致させ、CLS（Cumulative Layout Shift）を防ぐこと

### スケルトンの種類
- **通常のコンテンツ**: `Skeleton` コンポーネントを使用してロード後のレイアウトと同じ構造を作成
- **フォームコンポーネント**: 入力フィールドを `disabled` にした実際のフォームコンポーネントを配置

### 命名規則
Next.js の組み込み型や標準 API と紛らわしい名前は避けること。
- 例: `searchParams` は Next.js の searchParams や URLSearchParams を連想させるため、パース済みのオブジェクトには使用しない
- パース済みや変換済みのデータには、その性質を明確に表す名前を使用すること
- 例: `searchParams` → `searchCondition`、`rawData` → `parsedData` など

### 実装例

```tsx
// Page コンポーネント（Suspense を配置）
export default async function Page({
  params,
  searchParams
}: PageProps<"/foo/[id]">) {
  const idPromise = params.then(({ id }) => id);
  const searchConditionPromise = searchParams.then((sp) =>
    parse(searchConditionSchema, sp)
  );

  return (
    <Suspense fallback={<FooSkeleton />}>
      <FooContainer
        idPromise={idPromise}
        searchConditionPromise={searchConditionPromise}
      />
    </Suspense>
  );
}

// Container コンポーネント（Suspense は含めない）
async function FooContainer({
  idPromise,
  searchConditionPromise
}: FooContainerProps) {
  const id = await idPromise;
  const searchCondition = await searchConditionPromise;
  const data = await getData(id, searchCondition);

  return <FooPresenter data={data} />;
}

// スケルトンコンポーネント（ロード後と完全に一致するレイアウト）
function FooSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

// フォームの場合
function FooFormSkeleton() {
  return <FooForm disabled />;  // 実際のフォームを disabled で表示
}

// Container 内で別の非同期コンポーネントをネストする場合（例外）
async function ParentContainer({ idPromise }: ParentContainerProps) {
  const id = await idPromise;
  const parentData = await getParentData(id);

  return (
    <div>
      <ParentPresenter data={parentData} />
      {/* Container 内で別の非同期コンポーネントをネストする場合は Suspense を配置 */}
      <Suspense fallback={<ChildSkeleton />}>
        <ChildContainer idPromise={Promise.resolve(id)} />
      </Suspense>
    </div>
  );
}
```
