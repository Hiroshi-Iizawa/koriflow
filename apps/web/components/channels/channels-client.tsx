"use client"

import { useState } from "react"
import { DataTable } from "@koriflow/ui"
import { Plus, ShoppingCart, Search, RefreshCw } from "lucide-react"
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@koriflow/ui"
import { trpc } from "@lib/trpc/client"
import { columns } from "../../app/channels/columns"
import { Skeleton } from "@koriflow/ui"
import { ChannelDialog } from "./channel-dialog"
import { channelKindSchema } from "../../lib/validators/channel"
import { z } from "zod"

export function ChannelsClient() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const limit = 20

  const { data, isLoading, error, refetch } = trpc.channel.list.useQuery({
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
            <ShoppingCart className="h-8 w-8 text-kori-600" />
            販売チャネル管理
          </h1>
          <p className="text-kori-600 mt-2">
            商品を販売する外部プラットフォームやシステムとの連携を管理します
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規チャネル
        </Button>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-kori-700">
              総チャネル数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : data?.total || 0}
            </div>
            <p className="text-xs text-kori-600 mt-1">
              登録済みチャネル
            </p>
          </CardContent>
        </Card>

        {channelKindSchema.options.map((kind) => {
          const count = data?.items.filter(ch => ch.kind === kind).length || 0
          const kindLabels = {
            SHOPIFY: "Shopify",
            EC_CATALOG: "ECカタログ",
            WHOLESALE: "卸売",
            POS: "POS",
          }
          
          return (
            <Card key={kind}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-kori-700">
                  {kindLabels[kind]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : count}
                </div>
                <p className="text-xs text-kori-600 mt-1">
                  {count > 0 ? "アクティブ" : "未登録"}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 検索バー */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kori-400 h-4 w-4" />
              <Input
                placeholder="チャネルコード、チャネル名で検索..."
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
            <Button 
              variant="outline"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* データテーブル */}
      <Card>
        <CardHeader>
          <CardTitle>チャネル一覧</CardTitle>
          <CardDescription>
            登録されている販売チャネルの一覧です。クリックして詳細を確認できます。
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

      {/* チャネル作成ダイアログ */}
      <ChannelDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          setDialogOpen(false)
          refetch()
        }}
      />
    </div>
  )
}