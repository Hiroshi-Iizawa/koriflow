"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Package2, ArrowUpDown } from "lucide-react"
import { Button } from "@koriflow/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@koriflow/ui"
import Link from "next/link"
import { Badge } from "@koriflow/ui"
import type { Bundle } from "../../lib/validators/bundle"

export const columns: ColumnDef<Bundle>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          商品コード
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const code = row.getValue("code") as string
      return (
        <Link 
          href={`/bundles/${row.original.id}`}
          className="flex items-center gap-2 font-medium text-violet-700 hover:text-violet-900"
        >
          <Package2 className="h-4 w-4" />
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
          商品名
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          {row.original.productFeature && (
            <span className="text-sm text-kori-600 line-clamp-1">
              {row.original.productFeature}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "components",
    header: "構成数",
    cell: ({ row }) => {
      const components = row.original.components || []
      const totalQty = components.reduce((sum, comp) => sum + comp.qty, 0)
      
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
            {components.length}種類
          </Badge>
          <span className="text-sm text-kori-600">
            (計{totalQty}個)
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "janCode",
    header: "JANコード",
    cell: ({ row }) => {
      const janCode = row.getValue("janCode") as string | null
      return janCode || <span className="text-kori-400">-</span>
    },
  },
  {
    accessorKey: "channelListings",
    header: "販売チャネル",
    cell: ({ row }) => {
      const listings = row.original.channelListings || []
      const activeListings = listings.filter(l => l.isActive)
      
      if (activeListings.length === 0) {
        return <span className="text-kori-400">未設定</span>
      }
      
      return (
        <div className="flex gap-1 flex-wrap">
          {activeListings.slice(0, 2).map((listing) => (
            <Badge 
              key={listing.id}
              variant="secondary" 
              className="text-xs"
            >
              {listing.channel.name}
            </Badge>
          ))}
          {activeListings.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{activeListings.length - 2}
            </Badge>
          )}
        </div>
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
      const bundle = row.original

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
              <Link href={`/bundles/${bundle.id}`}>
                詳細を見る
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/bundles/${bundle.id}/edit`}>
                編集
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/bundles/${bundle.id}/stock`}>
                在庫状況確認
              </Link>
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