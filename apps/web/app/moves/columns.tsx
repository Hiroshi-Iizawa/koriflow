"use client"

import { ColumnDef } from "@tanstack/react-table"
import { InventoryMove, ItemLot, Item, MoveReason } from "@koriflow/db"
import { Button } from "@koriflow/ui"
import { ArrowUpDown } from "lucide-react"

type MoveWithRelations = InventoryMove & {
  lot: ItemLot & {
    item: Item
  }
}

const reasonLabels: Record<MoveReason, string> = {
  RECEIVE: "入庫",
  ISSUE: "出庫",
  ADJUST: "調整",
  CONSUME: "消費",
  PRODUCE: "製造",
}

export const columns: ColumnDef<MoveWithRelations>[] = [
  {
    accessorKey: "at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          日時
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return new Date(row.getValue("at")).toLocaleString('ja-JP')
    },
  },
  {
    accessorKey: "lot.lotCode",
    header: "ロットコード",
  },
  {
    accessorKey: "lot.item.name",
    header: "商品",
  },
  {
    accessorKey: "deltaQty",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          数量
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const deltaQty = parseFloat(row.getValue("deltaQty"))
      const isPositive = deltaQty > 0
      return (
        <span className={isPositive ? "text-green-600" : "text-red-600"}>
          {isPositive ? "+" : ""}{deltaQty.toFixed(3)}
        </span>
      )
    },
  },
  {
    accessorKey: "reason",
    header: "理由",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as MoveReason
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {reasonLabels[reason]}
        </span>
      )
    },
  },
  {
    accessorKey: "ref",
    header: "参照",
    cell: ({ row }) => {
      return row.getValue("ref") || "なし"
    },
  },
]