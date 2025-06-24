"use client"

import { useState } from "react"
import { DataTable } from "@koriflow/ui"
import { Plus, Package2, Search } from "lucide-react"
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@koriflow/ui"
import Link from "next/link"
import { trpc } from "@lib/trpc/client"
import { columns } from "../../app/bundles/columns"
import { Skeleton } from "@koriflow/ui"

export function BundlesClient() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, error } = trpc.bundle.list.useQuery({
    page,
    limit,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-red-600">エラーが発生しました: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-kori-800 flex items-center gap-3">
            <Package2 className="h-8 w-8 text-violet-600" />
            セット商品管理
          </h1>
          <p className="text-kori-600 mt-2">
            複数商品を組み合わせたギフトセットやバンドル商品を管理します
          </p>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href="/bundles/new">
            <Plus className="mr-2 h-4 w-4" />
            新規セット商品
          </Link>
        </Button>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-violet-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-kori-700">
              登録セット数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-700">
              {isLoading ? <Skeleton className="h-8 w-16" /> : data?.total || 0}
            </div>
            <p className="text-xs text-kori-600 mt-1">
              アクティブなセット商品
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-kori-700">
              平均構成数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-700">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                data?.items.reduce((sum, bundle) => 
                  sum + (bundle.components?.length || 0), 0
                ) / (data?.items.length || 1) || 0
              ).toFixed(1)}
            </div>
            <p className="text-xs text-kori-600 mt-1">
              種類/セット
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-kori-700">
              販売中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-700">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                data?.items.filter(bundle => 
                  bundle.channelListings?.some(l => l.isActive)
                ).length || 0
              )}
            </div>
            <p className="text-xs text-kori-600 mt-1">
              チャネル展開中
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-kori-700">
              今月登録
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-700">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                data?.items.filter(bundle => {
                  const created = new Date(bundle.createdAt)
                  const now = new Date()
                  return created.getMonth() === now.getMonth() && 
                         created.getFullYear() === now.getFullYear()
                }).length || 0
              )}
            </div>
            <p className="text-xs text-kori-600 mt-1">
              新規セット
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 検索バー */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kori-400 h-4 w-4" />
              <Input
                placeholder="商品コード、商品名で検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => setSearch("")}
              disabled={!search}
            >
              クリア
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* データテーブル */}
      <Card>
        <CardHeader>
          <CardTitle>セット商品一覧</CardTitle>
          <CardDescription>
            登録されているセット商品の一覧です。クリックして詳細を確認できます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <DataTable 
                columns={columns} 
                data={data?.items || []} 
              />
              
              {/* ページネーション */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-kori-600">
                    {data.total}件中 {(page - 1) * limit + 1}〜
                    {Math.min(page * limit, data.total)}件を表示
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      前へ
                    </Button>
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, data.totalPages))].map((_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className={pageNum === page ? "bg-violet-600" : ""}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                      {data.totalPages > 5 && (
                        <span className="px-2 text-kori-600">...</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.totalPages}
                    >
                      次へ
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}