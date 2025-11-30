# フォーム実装ガイドライン

## 必須要件

フォームは必ず shadcn/ui の Form コンポーネント、react-hook-form、valibot を使用して実装すること。

## 使用するライブラリとコンポーネント

- **shadcn/ui Form コンポーネント**: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormDescription`, `FormControl`
- **react-hook-form**: `useForm` フック、フォーム状態管理
- **valibot**: スキーマ定義とバリデーション（`@hookform/resolvers/valibot` の `valibotResolver` を使用）

## 重要な原則

### placeholder の使用禁止
- `placeholder` 属性の使用を避け、`FormDescription` で説明を記載すること
- `placeholder` は入力中に見えなくなるため、重要な情報の提供には不適切
- `FormDescription` は常に表示され、ユーザーに継続的なガイダンスを提供する

### ハイドレーション対応

ハイドレーション完了前は disabled を設定し、ユーザー入力が行えないようにすること

- **必須**: `useIsHydrated` フックを使用してハイドレーション状態を管理すること
- ハイドレーション前は入力コントロールを無効化（disabled）するなど、誤操作を防ぐ処理を実装すること
- これにより以下の問題を回避する:
  - ハイドレーション前の入力内容がクリアされる
  - イベントリスナーが正しく設定される前の操作により動作が失敗する

### フォームのスケルトン
- 入力フィールドを `disabled` にした実際のフォームコンポーネントを配置
- 例: `<FooForm disabled />`

## 実装例

```tsx
"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import * as v from "valibot";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useForm } from "react-hook-form";

// valibot でスキーマを定義
const formSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  name: v.string(),
  age: v.optional(v.pipe(v.string(), v.transform(Number))),
});

type FormValues = v.InferOutput<typeof formSchema>;

export function ExampleForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      name: "",
      age: "",
    },
    resolver: valibotResolver(formSchema),
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormDescription>
                ログインに使用するメールアドレスを入力してください
              </FormDescription>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormDescription>フルネームで入力してください</FormDescription>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">送信</Button>
      </form>
    </Form>
  );
}
```

## スケルトン実装例

```tsx
// フォームのスケルトン（実際のフォームを disabled で表示）
function FooFormSkeleton() {
  return <FooForm disabled />;
}
```
