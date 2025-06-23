'use client'

import { Badge, Card, CardContent, CardHeader, CardTitle, Button } from "@koriflow/ui"
import { FileText, Package, CheckCircle, Clock, Truck, Calendar, User } from "lucide-react"
import { cn } from "@lib/utils"
import Link from "next/link"

interface OrderItem {
  id: string
  orderNo: string
  orderedAt: string
  status: string
  amount?: number
  lineCount?: number
  customerName?: string
}

interface RecentOrdersProps {
  type: 'sales' | 'purchase'
  orders: OrderItem[]
  partnerId: string
  partnerKind: string
  className?: string
}

const statusConfig = {
  DRAFT: { label: '下書き', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  CONFIRMED: { label: '確定済み', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  PICKED: { label: 'ピッキング済み', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  SHIPPED: { label: '出荷済み', color: 'bg-green-100 text-green-700 border-green-200' },
  CLOSED: { label: '完了', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  CANCELLED: { label: 'キャンセル', color: 'bg-red-100 text-red-700 border-red-200' },
}

const statusIcons = {
  DRAFT: <Clock className="h-4 w-4" />,
  CONFIRMED: <CheckCircle className="h-4 w-4" />,
  PICKED: <Package className="h-4 w-4" />,
  SHIPPED: <Truck className="h-4 w-4" />,
  CLOSED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <Clock className="h-4 w-4" />,
}

export function RecentOrders({ type, orders, partnerId, partnerKind, className }: RecentOrdersProps) {
  const isSales = type === 'sales'
  const title = isSales ? '最近の受注' : '最近の発注'
  const icon = isSales ? <FileText className="h-5 w-5 text-kori-600" /> : <Package className="h-5 w-5 text-kori-600" />
  const basePath = isSales ? '/sales-orders' : '/purchase-orders'

  if ((isSales && partnerKind !== 'CUSTOMER' && partnerKind !== 'BOTH') ||
      (!isSales && partnerKind !== 'VENDOR' && partnerKind !== 'BOTH')) {
    return null
  }

  return (
    <Card className={cn("border-kori-200", className)}>
      <CardHeader className="bg-kori-50/30 border-b border-kori-100 pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2 text-kori-800 font-semibold">
            {icon}
            {title}
          </span>
          <Link href={`${basePath}?partnerId=${partnerId}`}>
            <Button variant="ghost" size="sm" className="hover:bg-kori-50 text-kori-600">
              すべて表示 →
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {orders.length > 0 ? (
          <div className="max-h-[300px] overflow-auto">
            <table className="w-full">
              <thead className="bg-kori-50/50 border-b border-kori-100">
                <tr className="text-xs text-kori-700">
                  <th className="text-left p-3 font-medium">オーダー番号</th>
                  <th className="text-left p-3 font-medium">日付</th>
                  <th className="text-left p-3 font-medium">ステータス</th>
                  {isSales && <th className="text-right p-3 font-medium">品目数</th>}
                  <th className="text-right p-3 font-medium">金額</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig]
                  return (
                    <tr 
                      key={order.id}
                      className={cn(
                        "border-b border-kori-100 hover:bg-kori-50/30 transition-colors cursor-pointer",
                        index === orders.length - 1 && "border-b-0"
                      )}
                      onClick={() => window.location.href = `${basePath}/${order.id}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {statusIcons[order.status as keyof typeof statusIcons]}
                          <span className="font-medium text-kori-800">{order.orderNo}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm text-kori-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.orderedAt).toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant="outline"
                          className={cn("text-xs", status?.color)}
                        >
                          {status?.label}
                        </Badge>
                      </td>
                      {isSales && (
                        <td className="p-3 text-right text-sm text-kori-700">
                          {order.lineCount ? `${order.lineCount}品目` : '-'}
                        </td>
                      )}
                      <td className="p-3 text-right font-medium text-kori-800">
                        {order.amount 
                          ? `¥${order.amount.toLocaleString()}` 
                          : '-'
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            {icon}
            <p className="text-kori-500 mt-2">取引履歴がありません</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}