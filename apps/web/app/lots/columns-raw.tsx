"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ItemLot, Item, InventoryLocation } from "@koriflow/db"
import { Button, Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@koriflow/ui"
import { ArrowUpDown, MoreHorizontal, Edit, TrendingUp, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"

type LotWithRelations = ItemLot & {
  item: Item
  location: InventoryLocation | null
}

// Helper function to check expiry status
const getExpiryStatus = (expiryDate: Date | null) => {
  if (!expiryDate) return null
  
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffDays = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const formattedDate = expiry.toLocaleDateString('ja-JP')
  
  if (diffDays < 0) return { variant: 'over' as const, label: '期限切れ', days: diffDays }
  if (diffDays <= 30) return { variant: 'soon' as const, label: `${diffDays}日`, days: diffDays }
  return { variant: 'default' as const, label: formattedDate, days: diffDays }
}

export const rawMaterialsColumns: ColumnDef<LotWithRelations>[] = [
  {
    accessorKey: "lotCode", 
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-kori-700 hover:text-kori-900"
        >
          ロットコード
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="font-mono text-sm text-kori-800 w-[180px]">
          {row.getValue("lotCode")}
        </div>
      )
    }
  },
  {
    accessorKey: "item.name",
    header: "原材料名",
    cell: ({ row }) => {
      return (
        <div className="font-medium text-kori-800">
          {row.original.item.name}
        </div>
      )
    }
  },
  {
    accessorKey: "qty",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-kori-700 hover:text-kori-900"
        >
          数量
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const qty = parseFloat(row.getValue("qty"))
      const isZero = qty === 0
      const isNegative = qty < 0
      
      return (
        <div className={`text-right tabular-nums font-medium ${
          isNegative ? 'text-red-600' : isZero ? 'text-amber-600' : ''
        }`}>
          {qty.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
          {(isZero || isNegative) && (
            <span className="inline-block ml-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </div>
      )
    },
  },
  {
    id: "expiry",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-kori-700 hover:text-kori-900"
        >
          有効期限
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const expiryDate = row.original.expiryDate
      if (!expiryDate) return <span className="text-kori-400">期限管理なし</span>
      
      const status = getExpiryStatus(expiryDate)
      const formattedDate = new Date(expiryDate).toLocaleDateString('ja-JP')
      
      if (!status) return <span className="text-kori-700">{formattedDate}</span>
      
      if (status.variant === 'over') {
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        )
      }
      
      if (status.variant === 'soon') {
        return (
          <Badge variant={status.variant}>
            {status.days <= 7 ? `${status.days}日` : formattedDate}
          </Badge>
        )
      }
      
      return <span className="text-kori-700">{formattedDate}</span>
    },
  },
  {
    accessorKey: "batchNo",
    header: "バッチ番号",
    cell: ({ row }) => {
      return row.getValue("batchNo") || <span className="text-kori-400">なし</span>
    },
  },
  {
    accessorKey: "location.name",
    header: "保管場所",
    cell: ({ row }) => {
      const location = row.original.location
      return location?.name || <span className="text-kori-400">場所未設定</span>
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const lot = row.original
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">メニューを開く</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem asChild>
              <Link href={`/lots/${lot.id}/edit`} className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                編集
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              在庫移動
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              廃棄
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]