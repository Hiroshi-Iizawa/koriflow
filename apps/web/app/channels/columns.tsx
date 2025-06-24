"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ShoppingCart, ArrowUpDown, Globe, Store, Package, Warehouse } from "lucide-react"
import { Button, Badge } from "@koriflow/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@koriflow/ui"
import Link from "next/link"
import type { Channel } from "../../lib/validators/channel"

const channelKindIcons = {
  SHOPIFY: Globe,
  EC_CATALOG: Store,
  WHOLESALE: Warehouse,
  POS: Package,
}

const channelKindLabels = {
  SHOPIFY: "Shopify",
  EC_CATALOG: "ECカタログ",
  WHOLESALE: "卸売",
  POS: "POS",
}

const channelKindColors = {
  SHOPIFY: "bg-green-100 text-green-700 border-green-200",
  EC_CATALOG: "bg-blue-100 text-blue-700 border-blue-200",
  WHOLESALE: "bg-orange-100 text-orange-700 border-orange-200",
  POS: "bg-purple-100 text-purple-700 border-purple-200",
}

export const columns: ColumnDef<Channel>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          チャネルコード
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const code = row.getValue("code") as string
      const kind = row.original.kind
      const Icon = channelKindIcons[kind]
      
      return (
        <Link 
          href={`/channels/${row.original.id}`}
          className="flex items-center gap-2 font-medium text-kori-700 hover:text-kori-900"
        >
          <Icon className="h-4 w-4" />
          {code}
        </Link>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          チャネル名
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "kind",
    header: "種別",
    cell: ({ row }) => {
      const kind = row.getValue("kind") as keyof typeof channelKindLabels
      
      return (
        <Badge 
          variant="outline" 
          className={channelKindColors[kind]}
        >
          {channelKindLabels[kind]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "endpoint",
    header: "エンドポイント",
    cell: ({ row }) => {
      const endpoint = row.getValue("endpoint") as string | null
      return endpoint ? (
        <span className="font-mono text-sm text-kori-600 truncate max-w-[200px] block">
          {endpoint}
        </span>
      ) : (
        <span className="text-kori-400">-</span>
      )
    },
  },
  {
    accessorKey: "_count.mappings",
    header: "商品数",
    cell: ({ row }) => {
      const count = row.original._count?.mappings || 0
      return (
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-kori-600" />
          <span>{count.toLocaleString()}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: "ステータス",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <Badge variant={isActive ? "success" : "secondary"}>
          {isActive ? "有効" : "無効"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          作成日
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return date.toLocaleDateString("ja-JP")
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const channel = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">メニューを開く</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/channels/${channel.id}`}>
                詳細を見る
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/channels/${channel.id}/edit`}>
                編集
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/channels/${channel.id}/listings`}>
                商品マッピング管理
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              同期実行
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]