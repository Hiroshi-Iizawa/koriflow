'use client'

import { useState, useEffect, useRef } from "react"
import { Button, Badge, useToast, ToastAction } from "@koriflow/ui"
import { Plus, Package, Truck, CheckCircle, XCircle, GripVertical, Search, Filter, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { trpc } from "@lib/trpc/client"
import { useRouter } from "next/navigation"

type SOStatus = "DRAFT" | "CONFIRMED" | "PICKED" | "SHIPPED" | "CLOSED" | "CANCELLED"

interface SalesOrdersKanbanProps {
  orders: any[]
}

// ステータス設定
const statusConfig = {
  DRAFT: {
    title: "下書き",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    headerColor: "bg-gray-100 text-gray-800 border-gray-300",
    icon: Package,
  },
  CONFIRMED: {
    title: "確定済み",
    color: "bg-kori-50 text-kori-700 border-kori-200",
    headerColor: "bg-kori-100 text-kori-800 border-kori-300",
    icon: CheckCircle,
  },
  PICKED: {
    title: "ピッキング済み",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    headerColor: "bg-amber-100 text-amber-800 border-amber-300",
    icon: Package,
  },
  SHIPPED: {
    title: "出荷済み",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    headerColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: Truck,
  },
  CLOSED: {
    title: "完了",
    color: "bg-slate-50 text-slate-700 border-slate-200",
    headerColor: "bg-slate-100 text-slate-800 border-slate-300",
    icon: CheckCircle,
  },
  CANCELLED: {
    title: "キャンセル",
    color: "bg-red-50 text-red-700 border-red-200",
    headerColor: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
  },
}

// ステータス遷移ルール
const validTransitions: Record<SOStatus, SOStatus[]> = {
  DRAFT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PICKED', 'CANCELLED'],
  PICKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: []
}

export function SalesOrdersKanban({ orders: initialOrders }: SalesOrdersKanbanProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [draggedOrder, setDraggedOrder] = useState<any>(null)
  const [dragOverStatus, setDragOverStatus] = useState<SOStatus | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [previousState, setPreviousState] = useState<{ orderId: string; status: SOStatus } | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  
  const updateOrderMutation = trpc.salesOrder.update.useMutation({
    onSuccess: () => {
      router.refresh()
    },
  })

  const confirmOrderMutation = trpc.salesOrder.confirm.useMutation({
    onSuccess: () => {
      router.refresh()
    },
  })

  // ESCキーでキャンセル
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && draggedOrder) {
        setDraggedOrder(null)
        setDragOverStatus(null)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [draggedOrder])

  // Undo機能
  const handleUndo = async () => {
    if (!previousState) return
    
    const updatedOrders = orders.map(order => 
      order.id === previousState.orderId 
        ? { ...order, status: previousState.status }
        : order
    )
    setOrders(updatedOrders)
    
    await updateOrderMutation.mutateAsync({
      id: previousState.orderId,
      status: previousState.status
    })
    
    setPreviousState(null)
    toast({
      title: "元に戻しました",
      description: `ステータスを${statusConfig[previousState.status].title}に戻しました`,
      variant: "success",
    })
  }

  const isValidTransition = (from: SOStatus, to: SOStatus) => {
    return validTransitions[from]?.includes(to) || false
  }

  const handleDragStart = (e: React.DragEvent, order: any) => {
    setDraggedOrder(order)
    e.dataTransfer.effectAllowed = 'move'
    
    // カスタムドラッグイメージを一時的に無効化
    // const dragImage = new Image()
    // dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='
    // e.dataTransfer.setDragImage(dragImage, 0, 0)
  }

  const handleDragOver = (e: React.DragEvent, status: SOStatus) => {
    e.preventDefault()
    
    if (!draggedOrder) return
    
    const currentStatus = draggedOrder.status as SOStatus
    if (isValidTransition(currentStatus, status)) {
      e.dataTransfer.dropEffect = 'move'
      setDragOverStatus(status)
    } else {
      e.dataTransfer.dropEffect = 'none'
    }
  }

  const handleDragLeave = () => {
    setDragOverStatus(null)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: SOStatus) => {
    e.preventDefault()
    setDragOverStatus(null)
    
    if (!draggedOrder || draggedOrder.status === newStatus) return

    const currentStatus = draggedOrder.status as SOStatus
    if (!isValidTransition(currentStatus, newStatus)) {
      toast({
        title: "無効な移動",
        description: "この状態遷移は許可されていません",
        variant: "destructive",
      })
      return
    }

    // 前の状態を保存
    setPreviousState({ orderId: draggedOrder.id, status: currentStatus })

    // 楽観的更新
    const updatedOrders = orders.map(order => 
      order.id === draggedOrder.id 
        ? { ...order, status: newStatus }
        : order
    )
    setOrders(updatedOrders)

    try {
      if (currentStatus === 'DRAFT' && newStatus === 'CONFIRMED') {
        const result = await confirmOrderMutation.mutateAsync({ id: draggedOrder.id })
        if (result.status === 'PARTIAL') {
          toast({
            title: "一部在庫不足",
            description: "引当可能な分のみ引当てました",
            action: <ToastAction altText="Undo" onClick={handleUndo}>元に戻す</ToastAction>,
          })
        }
      } else {
        await updateOrderMutation.mutateAsync({
          id: draggedOrder.id,
          status: newStatus
        })
      }
      
      toast({
        title: "ステータス更新",
        description: `${statusConfig[newStatus].title}に変更しました`,
        action: <ToastAction altText="Undo" onClick={handleUndo}>元に戻す</ToastAction>,
        variant: "success",
      })
    } catch (error) {
      setOrders(orders)
      setPreviousState(null)
      toast({
        title: "エラー",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleDragEnd = () => {
    setDraggedOrder(null)
    setDragOverStatus(null)
  }

  // フィルタリング
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    return (
      order.soNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.partner.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const groupedOrders = filteredOrders.reduce((acc, order) => {
    const status = order.status as SOStatus
    if (!acc[status]) acc[status] = []
    acc[status].push(order)
    return acc
  }, {} as Record<SOStatus, any[]>)

  const columns: SOStatus[] = ["DRAFT", "CONFIRMED", "PICKED", "SHIPPED"]

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="flex-none px-6 py-4 bg-white border-b border-kori-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-kori-800">受注管理</h1>
            <p className="text-sm text-kori-600 mt-1">
              ドラッグ&ドロップでステータス変更 • ESCでキャンセル
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* 検索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="注文番号・顧客名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-kori-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kori-400 w-64"
              />
            </div>
            <Link href="/sales-orders/new">
              <Button className="bg-kori-500 hover:bg-kori-400 text-white shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                新規受注
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* カンバンボード */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-6">
        <div className="flex gap-6 h-full">
          {columns.map((status) => {
            const config = statusConfig[status]
            const Icon = config.icon
            const statusOrders = groupedOrders[status] || []
            const isValidDrop = draggedOrder && isValidTransition(draggedOrder.status, status)

            return (
              <div key={status} className="flex flex-col min-w-[20rem] h-full">
                {/* 列ヘッダー（固定） */}
                <div className={`sticky top-0 z-10 mb-4 p-4 rounded-lg border-2 shadow-sm bg-white/95 backdrop-blur ${
                  config.headerColor
                } ${
                  isValidDrop ? 'ring-2 ring-kori-400 ring-offset-2' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <h3 className="font-semibold">{config.title}</h3>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {statusOrders.length}
                    </Badge>
                  </div>
                </div>

                {/* ドロップゾーン */}
                <div 
                  className={`flex-1 space-y-3 p-2 rounded-lg transition-colors overflow-y-auto scrollbar-thin ${
                    dragOverStatus === status 
                      ? 'bg-kori-100 border-2 border-dashed border-kori-400' 
                      : isValidDrop
                      ? 'border-2 border-dashed border-gray-300'
                      : 'border-2 border-transparent'
                  }`}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {statusOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isDragging={draggedOrder?.id === order.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      config={config}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 注文カードコンポーネント
function OrderCard({ order, isDragging, onDragStart, onDragEnd, config }: any) {
  const router = useRouter()

  const handleDeliveryNote = async (orderId: string) => {
    window.open(`/api/sales-orders/${orderId}/delivery-note`, '_blank')
  }

  const handleYamatoCSV = async (orderId: string) => {
    try {
      const response = await fetch('/api/sales-orders/yamato-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderIds: [orderId] }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `yamato-b2-${order.soNo}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert('CSVの生成に失敗しました')
    }
  }
  // 在庫不足チェック
  const hasStockIssue = order.lines.some((line: any) => {
    const allocatedQty = line.allocations.reduce((sum: number, alloc: any) => 
      sum + parseFloat(alloc.qty), 0
    )
    return allocatedQty < parseFloat(line.qty)
  })

  // 商品数と合計数量を計算
  const totalQty = order.lines.reduce((sum: number, line: any) => 
    sum + parseFloat(line.qty), 0
  )

  return (
    <div
      className={`group relative p-4 hover:shadow-md transition-all border rounded-lg ${config.color} bg-white ${
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab hover:cursor-grab active:cursor-grabbing'
      }`}
      draggable={true}
      onDragStart={(e) => onDragStart(e, order)}
      onDragEnd={onDragEnd}
    >
      {/* ドラッグハンドル */}
      <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      <div className="space-y-3 ml-4">
        {/* ヘッダー */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{order.soNo}</span>
              {hasStockIssue && order.status === 'CONFIRMED' && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  在庫不足
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(order.orderedAt).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {order._count.lines}品目
            </Badge>
            <Badge variant="secondary" className="text-xs">
              計{totalQty}個
            </Badge>
          </div>
        </div>

        {/* 顧客情報 */}
        <div>
          <p className="font-medium text-sm">{order.partner.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">{order.partner.code}</p>
            {order.shipTo && (
              <p className="text-xs text-gray-500">
                → {order.shipTo.label}
              </p>
            )}
          </div>
        </div>

        {/* 商品リスト（最初の2件） */}
        <div className="space-y-1">
          {order.lines.slice(0, 2).map((line: any, idx: number) => (
            <div key={idx} className="text-xs text-gray-600 flex items-center justify-between">
              <span className="truncate flex-1">{line.item.name}</span>
              <span className="text-gray-500 ml-2">×{line.qty}</span>
            </div>
          ))}
          {order.lines.length > 2 && (
            <div className="text-xs text-gray-400">
              他{order.lines.length - 2}品目...
            </div>
          )}
        </div>

        {/* アクション */}
        <div className="flex gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-7"
            onClick={() => router.push(`/sales-orders/${order.id}`)}
          >
            詳細
          </Button>
          {order.status === 'PICKED' && (
            <Button 
              size="sm" 
              className="flex-1 text-xs h-7 bg-amber-500 hover:bg-amber-400"
              onClick={() => handleDeliveryNote(order.id)}
            >
              納品書
            </Button>
          )}
          {order.status === 'SHIPPED' && (
            <Button 
              size="sm" 
              className="flex-1 text-xs h-7 bg-emerald-500 hover:bg-emerald-400"
              onClick={() => handleYamatoCSV(order.id)}
            >
              B2 CSV
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}