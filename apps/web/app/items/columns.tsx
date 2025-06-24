"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Item } from "@koriflow/db"
import { Button } from "@koriflow/ui"
import { ArrowUpDown, MoreHorizontal, Edit, Copy, Trash2, Package, Beaker, Grid3X3 } from "lucide-react"
import Link from "next/link"

const TypeBadge = ({ type }: { type: string }) => {
  const config = {
    FIN: {
      label: "製品",
      className: "bg-kori-200 text-kori-800 border-kori-300",
      icon: Package
    },
    RAW: {
      label: "原材料", 
      className: "bg-amber-200 text-amber-900 border-amber-300",
      icon: Beaker
    },
    WIPNG: {
      label: "仕掛品",
      className: "bg-gray-200 text-gray-800 border-gray-300",
      icon: Grid3X3
    }
  }

  const { label, className, icon: Icon } = config[type as keyof typeof config] || config.WIPNG

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${className}`}>
      <Icon size={12} />
      {label}
    </span>
  )
}

export const columns: ColumnDef<Item>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-kori-700 hover:text-kori-900"
        >
          商品コード
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const hasStock = true // TODO: 在庫チェックロジック
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-kori-800">{row.getValue("code")}</span>
          {!hasStock && (
            <span className="w-2 h-2 bg-red-500 rounded-full" title="在庫なし"></span>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-kori-700 hover:text-kori-900"
        >
          商品名
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <Link 
          href={`/items/${row.original.id}`}
          className="text-kori-600 hover:text-kori-800 font-medium hover:underline"
        >
          {row.getValue("name")}
        </Link>
      )
    }
  },
  {
    accessorKey: "type",
    header: "区分",
    cell: ({ row }) => <TypeBadge type={row.getValue("type")} />
  },
  {
    accessorKey: "janCode",
    header: "JANコード",
    cell: ({ row }) => {
      const janCode = row.getValue("janCode") as string | null
      return janCode ? (
        <span className="font-mono text-xs text-kori-600">{janCode}</span>
      ) : (
        <span className="text-kori-400">-</span>
      )
    }
  },
  {
    accessorKey: "contentVolume",
    header: "内容量",
    cell: ({ row }) => {
      const volume = row.getValue("contentVolume") as string | null
      return volume || <span className="text-kori-400">-</span>
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-kori-700 hover:text-kori-900"
        >
          登録日
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString('ja-JP')
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/items/${row.original.id}/edit`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-kori-600 hover:text-kori-800 hover:bg-kori-50">
              <Edit className="h-4 w-4" />
              <span className="sr-only">編集</span>
            </Button>
          </Link>
          
          <div className="relative group">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-kori-600 hover:text-kori-800 hover:bg-kori-50">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">メニュー</span>
            </Button>
            
            {/* Dropdown menu placeholder - TODO: 実際のドロップダウン実装 */}
            <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-kori-200 py-1 hidden group-hover:block z-10">
              <button className="w-full px-4 py-2 text-sm text-left hover:bg-kori-50 flex items-center gap-2 text-kori-700">
                <Copy className="h-4 w-4" />
                複製
              </button>
              <button className="w-full px-4 py-2 text-sm text-left hover:bg-kori-50 flex items-center gap-2 text-red-600">
                <Trash2 className="h-4 w-4" />
                削除
              </button>
            </div>
          </div>
        </div>
      )
    },
  },
]