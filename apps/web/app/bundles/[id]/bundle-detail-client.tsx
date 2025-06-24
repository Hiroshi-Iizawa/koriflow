'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from "@koriflow/ui"
import { Package2, ArrowLeft, Edit, Trash2, Calculator, ShoppingCart, Eye, AlertCircle, BarChart3 } from "lucide-react"
import { trpc } from "@lib/trpc/client"
import { Skeleton } from "@koriflow/ui"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@koriflow/ui"

interface BundleDetailClientProps {
  bundleId: string
}

export function BundleDetailClient({ bundleId }: BundleDetailClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Bundle詳細取得
  const { data: bundle, isLoading, error } = trpc.bundle.get.useQuery({ id: bundleId })
  
  // 在庫計算
  const { data: stock } = trpc.bundle.calculateStock.useQuery({ id: bundleId })

  // Bundle削除
  const deleteBundle = trpc.bundle.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "セット商品を削除しました",
        variant: "success",
      })
      router.push('/bundles')
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const handleDelete = async () => {
    await deleteBundle.mutateAsync({ id: bundleId })
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">エラーが発生しました: {error.message}</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/bundles">一覧に戻る</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || !bundle) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/bundles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-kori-800 flex items-center gap-2">
              <Package2 className="h-6 w-6 text-violet-600" />
              {bundle.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                {bundle.code}
              </Badge>
              {bundle.janCode && (
                <span className="text-sm text-kori-600">JAN: {bundle.janCode}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/bundles/${bundleId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Link>
          </Button>
          
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>セット商品を削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は取り消せません。セット商品「{bundle.name}」を削除してもよろしいですか？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  削除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="stock">在庫状況</TabsTrigger>
          <TabsTrigger value="channels">販売チャネル</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bundle.imageUrl && (
                <div className="mb-4">
                  <img 
                    src={bundle.imageUrl} 
                    alt={bundle.name}
                    className="w-48 h-48 object-cover rounded-lg border border-kori-200"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-kori-600">ブランド名</label>
                  <p className="font-medium">{bundle.brandName || "-"}</p>
                </div>
                <div>
                  <label className="text-sm text-kori-600">メーカー名</label>
                  <p className="font-medium">{bundle.makerName || "-"}</p>
                </div>
              </div>

              {bundle.productFeature && (
                <div>
                  <label className="text-sm text-kori-600">商品説明</label>
                  <p className="mt-1 whitespace-pre-wrap">{bundle.productFeature}</p>
                </div>
              )}

              {bundle.usageNotes && (
                <div>
                  <label className="text-sm text-kori-600">使用上の注意</label>
                  <p className="mt-1 whitespace-pre-wrap">{bundle.usageNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* セット構成 */}
          <Card>
            <CardHeader>
              <CardTitle>セット構成</CardTitle>
              <CardDescription>
                このセット商品に含まれる商品の一覧
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bundle.components.map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between p-4 bg-violet-50/30 rounded-lg border border-violet-100">
                    <div className="flex items-center gap-4">
                      <Package2 className="h-5 w-5 text-violet-600" />
                      <div>
                        <p className="font-medium">{comp.component.code}</p>
                        <p className="text-sm text-kori-600">{comp.component.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className={
                        comp.component.type === 'FIN' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-teal-100 text-teal-700'
                      }>
                        {comp.component.type}
                      </Badge>
                      <span className="font-medium text-violet-700">
                        数量: {comp.qty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 在庫状況タブ */}
        <TabsContent value="stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-violet-600" />
                在庫状況
              </CardTitle>
              <CardDescription>
                構成商品の在庫から計算された、作成可能なセット数
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stock ? (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-violet-50 rounded-lg">
                    <p className="text-sm text-kori-600 mb-2">作成可能セット数</p>
                    <p className="text-4xl font-bold text-violet-700">{stock.availableQty}</p>
                    <p className="text-sm text-kori-600 mt-2">セット</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium text-kori-800">構成商品在庫詳細</h3>
                    {stock.components.map((comp) => {
                      const constraining = Math.floor(comp.availableQty / comp.requiredQty) === stock.availableQty
                      
                      return (
                        <div key={comp.itemId} className={`p-4 rounded-lg border ${
                          constraining ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{comp.itemCode}</p>
                              <p className="text-sm text-kori-600">{comp.itemName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-kori-600">
                                在庫: {comp.availableQty} / 必要: {comp.requiredQty}
                              </p>
                              <p className="font-medium">
                                作成可能: {Math.floor(comp.availableQty / comp.requiredQty)}セット
                              </p>
                              {comp.shortfall > 0 && (
                                <p className="text-sm text-red-600">
                                  不足: {comp.shortfall}
                                </p>
                              )}
                            </div>
                          </div>
                          {constraining && (
                            <Badge className="mt-2 bg-orange-100 text-orange-700">
                              制約要因
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Skeleton className="h-32 w-32 mx-auto rounded-full" />
                  <p className="text-kori-600 mt-4">在庫情報を取得中...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 販売チャネルタブ */}
        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-violet-600" />
                販売チャネル
              </CardTitle>
              <CardDescription>
                このセット商品が登録されている販売チャネル
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bundle.channelListings && bundle.channelListings.length > 0 ? (
                <div className="space-y-3">
                  {bundle.channelListings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <ShoppingCart className="h-5 w-5 text-kori-600" />
                        <div>
                          <p className="font-medium">{listing.channel.name}</p>
                          <p className="text-sm text-kori-600">
                            {listing.channel.code} ({listing.channel.kind})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-kori-600">外部SKU</p>
                          <p className="font-mono">{listing.externalSku}</p>
                        </div>
                        {listing.price && (
                          <div className="text-right">
                            <p className="text-sm text-kori-600">価格</p>
                            <p className="font-medium">¥{listing.price.toLocaleString()}</p>
                          </div>
                        )}
                        <Badge variant={listing.isActive ? "success" : "secondary"}>
                          {listing.isActive ? "公開中" : "非公開"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-kori-300 mx-auto mb-4" />
                  <p className="text-kori-600">まだ販売チャネルに登録されていません</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/channels">チャネル管理へ</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}