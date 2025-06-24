'use client'

import { useState } from "react"
import { Card, Button } from "@koriflow/ui"
import { Plus, Package, Truck, CheckCircle, XCircle, GripVertical } from "lucide-react"
import Link from "next/link"
import { trpc } from "@lib/trpc/client"
import { useRouter } from "next/navigation"

type SOStatus = "DRAFT" | "CONFIRMED" | "PICKED" | "SHIPPED" | "CLOSED" | "CANCELLED"

interface SalesOrdersClientProps {
  orders: any[]
}

export function SalesOrdersClient({ orders: initialOrders }: SalesOrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [draggedOrder, setDraggedOrder] = useState<any>(null)
  const [dragOverStatus, setDragOverStatus] = useState<SOStatus | null>(null)
  const router = useRouter()
  
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

  const statusConfig = {
    DRAFT: {
      title: "下書き",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: Package,
    },
    CONFIRMED: {
      title: "確定済み",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: CheckCircle,
    },
    PICKED: {
      title: "ピッキング済み",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: Package,
    },
    SHIPPED: {
      title: "出荷済み",
      color: "bg-green-100 text-green-800 border-green-300",
      icon: Truck,
    },
    CLOSED: {
      title: "完了",
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: CheckCircle,
    },
    CANCELLED: {
      title: "キャンセル",
      color: "bg-red-100 text-red-800 border-red-300",
      icon: XCircle,
    },
  }

  const groupedOrders = orders.reduce((acc, order) => {
    const status = order.status as SOStatus
    if (!acc[status]) acc[status] = []
    acc[status].push(order)
    return acc
  }, {} as Record<SOStatus, any[]>)

  const columns: SOStatus[] = ["DRAFT", "CONFIRMED", "PICKED", "SHIPPED"]

  // Valid status transitions
  const validTransitions: Record<SOStatus, SOStatus[]> = {
    DRAFT: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PICKED', 'CANCELLED'],
    PICKED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['CLOSED'],
    CLOSED: [],
    CANCELLED: []
  }

  const isValidTransition = (from: SOStatus, to: SOStatus) => {
    return validTransitions[from]?.includes(to) || false
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, order: any) => {
    setDraggedOrder(order)
    e.dataTransfer.effectAllowed = 'move'
    
    // Create custom drag image to prevent yellow background
    const dragImage = new Image()
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='
    e.dataTransfer.setDragImage(dragImage, 0, 0)
  }

  const handleDragOver = (e: React.DragEvent, status: SOStatus) => {
    e.preventDefault()
    
    if (!draggedOrder) return
    
    // Check if this is a valid drop target
    const validTransitions: Record<SOStatus, SOStatus[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PICKED', 'CANCELLED'],
      PICKED: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['CLOSED'],
      CLOSED: [],
      CANCELLED: []
    }
    
    const currentStatus = draggedOrder.status as SOStatus
    if (validTransitions[currentStatus].includes(status)) {
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

    // Check if the status transition is valid
    const validTransitions: Record<SOStatus, SOStatus[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PICKED', 'CANCELLED'],
      PICKED: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['CLOSED'],
      CLOSED: [],
      CANCELLED: []
    }

    const currentStatus = draggedOrder.status as SOStatus
    if (!validTransitions[currentStatus].includes(newStatus)) {
      alert('この状態遷移は許可されていません')
      return
    }

    // Update local state optimistically
    const updatedOrders = orders.map(order => 
      order.id === draggedOrder.id 
        ? { ...order, status: newStatus }
        : order
    )
    setOrders(updatedOrders)

    // Update in database
    try {
      // Special handling for DRAFT -> CONFIRMED (needs allocation)
      if (currentStatus === 'DRAFT' && newStatus === 'CONFIRMED') {
        const result = await confirmOrderMutation.mutateAsync({ id: draggedOrder.id })
        if (result.status === 'PARTIAL') {
          alert('一部の商品の在庫が不足しています。引当可能な分のみ引当てました。')
        }
      } else {
        // Normal status update
        await updateOrderMutation.mutateAsync({
          id: draggedOrder.id,
          status: newStatus
        })
      }
    } catch (error) {
      // Revert on error
      setOrders(orders)
      alert('更新に失敗しました: ' + (error as Error).message)
    }
  }

  const handleDragEnd = () => {
    setDraggedOrder(null)
    setDragOverStatus(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kori-800">受注管理</h1>
          <p className="text-sm text-kori-600 mt-1">
            受注から出荷までのフローを管理
          </p>
        </div>
        <Link href="/sales-orders/new">
          <Button className="bg-kori-500 hover:bg-kori-400 text-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            新規受注
          </Button>
        </Link>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((status) => {
          const config = statusConfig[status]
          const Icon = config.icon
          const statusOrders = groupedOrders[status] || []

          return (
            <div key={status} className="space-y-4">
              {/* Column Header */}
              <div className={`p-4 rounded-lg border-2 ${config.color} ${
                draggedOrder && isValidTransition(draggedOrder.status, status)
                  ? 'ring-2 ring-kori-400 ring-offset-2'
                  : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <h3 className="font-semibold">{config.title}</h3>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/50">
                    {statusOrders.length}
                  </span>
                </div>
              </div>

              {/* Drop Zone */}
              <div 
                className={`space-y-3 min-h-[400px] p-2 rounded-lg transition-colors ${
                  dragOverStatus === status 
                    ? 'bg-kori-100 border-2 border-dashed border-kori-400' 
                    : draggedOrder && isValidTransition(draggedOrder.status, status)
                    ? 'border-2 border-dashed border-gray-300'
                    : 'border-2 border-transparent'
                }`}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
              >
                {statusOrders.map((order) => (
                  <Card
                    key={order.id}
                    className={`p-4 hover:shadow-md transition-all border border-kori-200 bg-white ${
                      draggedOrder?.id === order.id ? 'opacity-50' : 'cursor-move'
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="space-y-2">
                      {/* Drag Handle and Header */}
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="font-semibold text-kori-800">
                            {order.soNo}
                          </span>
                          <span className="text-xs text-kori-600">
                            {new Date(order.orderedAt).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.customer.code}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          {order._count.lines}品目
                        </p>
                        {order.lines.slice(0, 2).map((line: any) => (
                          <div key={line.id} className="text-xs text-gray-500">
                            {line.item.name} × {line.qty}
                          </div>
                        ))}
                        {order.lines.length > 2 && (
                          <div className="text-xs text-gray-400">
                            他{order.lines.length - 2}品目...
                          </div>
                        )}
                      </div>

                      {/* Allocation Status */}
                      {status === 'CONFIRMED' && (
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">引当状況</span>
                            <span className="text-green-600 font-medium">
                              {order.lines.every((line: any) => 
                                line.allocations.reduce((sum: number, alloc: any) => 
                                  sum + parseFloat(alloc.qty), 0
                                ) >= parseFloat(line.qty)
                              ) ? '完了' : '一部'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          詳細
                        </Button>
                        {status === 'DRAFT' && (
                          <Button size="sm" className="flex-1 text-xs bg-kori-500 hover:bg-kori-400">
                            確定
                          </Button>
                        )}
                        {status === 'CONFIRMED' && (
                          <Button size="sm" className="flex-1 text-xs bg-yellow-500 hover:bg-yellow-400">
                            出荷
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Completed/Cancelled Orders Summary */}
      {(groupedOrders.CLOSED?.length > 0 || groupedOrders.CANCELLED?.length > 0) && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">完了・キャンセル済み</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedOrders.CLOSED?.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <h4 className="font-medium">完了済み ({groupedOrders.CLOSED.length})</h4>
                </div>
                <div className="space-y-2">
                  {groupedOrders.CLOSED.slice(0, 3).map((order) => (
                    <div key={order.id} className="text-sm text-gray-600">
                      {order.soNo} - {order.customer.name}
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            {groupedOrders.CANCELLED?.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <XCircle className="h-5 w-5" />
                  <h4 className="font-medium">キャンセル済み ({groupedOrders.CANCELLED.length})</h4>
                </div>
                <div className="space-y-2">
                  {groupedOrders.CANCELLED.slice(0, 3).map((order) => (
                    <div key={order.id} className="text-sm text-gray-600">
                      {order.soNo} - {order.customer.name}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}