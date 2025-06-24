'use client'

import { Button, DataTable } from "@koriflow/ui"
import Link from "next/link"
import { trpc } from "@lib/trpc/client"

const columns = [
  {
    accessorKey: "product.name",
    header: "製品名",
  },
  {
    accessorKey: "product.code",
    header: "製品コード",
  },
  {
    accessorKey: "version",
    header: "バージョン",
  },
  {
    accessorKey: "yieldPct",
    header: "歩留率",
    cell: ({ row }: any) => {
      const yieldPct = row.getValue("yieldPct")
      return yieldPct ? `${yieldPct}%` : "-"
    },
  },
  {
    accessorKey: "isActive",
    header: "状態",
    cell: ({ row }: any) => {
      const isActive = row.getValue("isActive")
      return isActive ? "有効" : "無効"
    },
  },
  {
    accessorKey: "items",
    header: "原材料",
    cell: ({ row }: any) => {
      const items = row.getValue("items") as any[]
      return `${items?.length || 0} 品目`
    },
  },
]

export default function RecipesPage() {
  const { data: recipes, isLoading } = trpc.recipe.list.useQuery({ isActive: true })

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">レシピ管理</h1>
          <Link href="/recipes/new">
            <Button>新規レシピ</Button>
          </Link>
        </div>
        <div className="rounded-lg border p-8 text-center">
          <p>レシピを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">レシピ管理</h1>
        <Link href="/recipes/new">
          <Button>新規レシピ</Button>
        </Link>
      </div>
      
      {recipes && recipes.length > 0 ? (
        <DataTable 
          columns={columns} 
          data={recipes} 
          searchKey="product.name"
          searchPlaceholder="レシピを検索..."
        />
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">レシピが見つかりません</h2>
          <p className="text-muted-foreground mb-4">
            生産計画を開始するために、最初のレシピを作成してください。
          </p>
          <Link href="/recipes/new">
            <Button>最初のレシピを作成</Button>
          </Link>
        </div>
      )}
    </div>
  )
}