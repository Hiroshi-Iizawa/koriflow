'use client'

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger, Badge, Button, Card, CardContent, CardHeader, CardTitle, useToast } from "@koriflow/ui"
import { Building2, Phone, Mail, Plus, Edit, ArrowLeft, DollarSign, FileText, Clock } from "lucide-react"
import Link from "next/link"
import { trpc } from "@lib/trpc/client"
import { useRouter } from "next/navigation"
import { PartnerDialog } from "./partner-dialog"
import { AddressList } from "./address-list"
import { RecentOrders } from "./recent-orders"
import { Info } from "../ui/info"
import { cn } from "@lib/utils"

interface PartnerDetailProps {
  partner: any
}

export function PartnerDetail({ partner }: PartnerDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showPartnerDialog, setShowPartnerDialog] = useState(false)

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return
      
      switch (e.key.toLowerCase()) {
        case 'e':
          e.preventDefault()
          setShowPartnerDialog(true)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const kindJP = {
    CUSTOMER: '得意先',
    VENDOR: '仕入先', 
    BOTH: '両方'
  }

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`
  }

  // Calculate stats from partner data
  const stats = {
    totalSales: partner.salesOrders?.reduce((total: number, order: any) => {
      const orderTotal = order.lines?.reduce((orderSum: number, line: any) => {
        return orderSum + (line.unitPrice * line.quantity)
      }, 0) || 0
      return total + orderTotal
    }, 0) || 0,
    pendingInvoices: partner.salesOrders?.filter((order: any) => 
      order.status === 'CONFIRMED' || order.status === 'PICKED'
    ).length || 0,
    unshippedOrders: partner.salesOrders?.filter((order: any) => 
      ['CONFIRMED', 'PICKED'].includes(order.status)
    ).length || 0,
  }

  // Format recent orders
  const recentSalesOrders = (partner.salesOrders || []).slice(0, 5).map((order: any) => {
    const orderTotal = order.lines?.reduce((sum: number, line: any) => {
      return sum + (line.unitPrice * line.quantity)
    }, 0) || 0
    
    return {
      id: order.id,
      orderNo: order.soNo,
      orderedAt: order.orderedAt,
      status: order.status,
      amount: orderTotal,
      lineCount: order._count?.lines || 0,
    }
  })

  const recentPurchaseOrders = (partner.purchaseOrders || []).slice(0, 5).map((order: any) => ({
    id: order.id,
    orderNo: order.poNo,
    orderedAt: order.createdAt,
    status: 'CONFIRMED',
    amount: 0,
    lineCount: 0,
  }))

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* ヘッダー帯 */}
      <div className="mb-8">
        <Link href="/partners" className="inline-block mb-6">
          <Button variant="ghost" size="sm" className="hover:bg-kori-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-kori-800">{partner.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-kori-600">{partner.code}</span>
              <Badge 
                variant={partner.kind === 'CUSTOMER' ? 'default' : 'secondary'}
                className={cn(
                  partner.kind === 'CUSTOMER' 
                    ? "bg-blue-100 text-blue-700 border-blue-200" 
                    : partner.kind === 'VENDOR'
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-purple-100 text-purple-700 border-purple-200"
                )}
              >
                {kindJP[partner.kind]}
              </Badge>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowPartnerDialog(true)}
            className="hover:bg-kori-50 border-kori-300"
          >
            <Edit className="h-4 w-4 mr-2 text-kori-600" />
            編集
          </Button>
        </div>
      </div>

      {/* メインコンテンツ - グリッドレイアウト */}
      <div className="space-y-6">
        {/* 概要カード (65%) + 住所リスト (35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 概要カード */}
          <Card className="lg:col-span-2 bg-white border border-kori-200 rounded-lg shadow-sm">
            <CardHeader className="bg-kori-50/30 border-b border-kori-100">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-kori-800">
                <Building2 className="h-5 w-5 text-kori-600" />
                概要
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-y-4">
              <Info 
                label="電話" 
                value={partner.phone} 
                icon={<Phone className="h-4 w-4" />}
              />
              <Info 
                label="区分" 
                value={kindJP[partner.kind]}
              />
              <Info 
                label="メール" 
                value={partner.email} 
                icon={<Mail className="h-4 w-4" />}
              />
              <Info 
                label="累計受注"
                value={formatCurrency(stats.totalSales)}
                accent
                icon={<DollarSign className="h-4 w-4" />}
              />
              <Info 
                label="未請求金額"
                value={`${stats.pendingInvoices}件`}
                icon={<FileText className="h-4 w-4" />}
              />
              <Info 
                label="未出荷オーダー"
                value={`${stats.unshippedOrders}件`}
                icon={<Clock className="h-4 w-4" />}
              />
            </CardContent>
          </Card>

          {/* 住所リスト */}
          <Card className="bg-white border border-kori-200 rounded-lg shadow-sm">
            <CardHeader className="bg-kori-50/30 border-b border-kori-100">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-kori-800">
                📍 住所
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <AddressList 
                partnerId={partner.id} 
                addresses={partner.addresses || []} 
              />
            </CardContent>
          </Card>
        </div>

        {/* 直近取引 */}
        <div className="space-y-4">
          {partner.kind === 'CUSTOMER' && (
            <RecentOrders
              type="sales"
              orders={recentSalesOrders}
              partnerId={partner.id}
              partnerKind={partner.kind}
            />
          )}
          
          {partner.kind === 'VENDOR' && (
            <RecentOrders
              type="purchase"
              orders={recentPurchaseOrders}
              partnerId={partner.id}
              partnerKind={partner.kind}
            />
          )}
          
          {partner.kind === 'BOTH' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <RecentOrders
                type="sales"
                orders={recentSalesOrders}
                partnerId={partner.id}
                partnerKind={partner.kind}
              />
              <RecentOrders
                type="purchase"
                orders={recentPurchaseOrders}
                partnerId={partner.id}
                partnerKind={partner.kind}
              />
            </div>
          )}
        </div>

        {/* 取引履歴タブ */}
        <Tabs defaultValue="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-kori-50/50">
              <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:text-kori-800">
                取引履歴
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="history" className="space-y-6">
            <div className="text-center py-12 text-kori-500">
              詳細な取引履歴表示機能は今後実装予定です
            </div>
          </TabsContent>
        </Tabs>
      </div>


      {/* 取引先編集ダイアログ */}
      <PartnerDialog
        partner={partner}
        open={showPartnerDialog}
        onOpenChange={setShowPartnerDialog}
      />
    </div>
  )
}