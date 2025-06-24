'use client'

import { useState, useMemo } from "react"
import { DataTable, Button } from "@koriflow/ui"
import Link from "next/link"
import { columns } from "@app/items/columns"
import { Plus, Package, Beaker, Grid3X3 } from "lucide-react"

type ItemType = "ALL" | "FIN" | "RAW" | "WIPNG"

interface ItemsClientProps {
  items: any[]
}

export function ItemsClient({ items }: ItemsClientProps) {
  const [typeFilter, setTypeFilter] = useState<ItemType>("ALL")

  const filteredItems = useMemo(() => {
    if (typeFilter === "ALL") {
      return items
    }
    return items.filter(item => item.type === typeFilter)
  }, [typeFilter, items])

  const TypeToggle = ({ value, icon: Icon, label, count }: { value: ItemType, icon: any, label: string, count: number }) => (
    <button
      onClick={() => setTypeFilter(value)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
        ${typeFilter === value 
          ? 'bg-kori-500 text-white shadow-md' 
          : 'bg-white text-kori-700 border border-kori-200 hover:bg-kori-50 hover:border-kori-300'
        }
      `}
    >
      <Icon size={16} />
      <span>{label}</span>
      <span className={`
        px-1.5 py-0.5 rounded text-xs font-semibold
        ${typeFilter === value ? 'bg-kori-400/30' : 'bg-kori-100 text-kori-600'}
      `}>
        {count}
      </span>
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-kori-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-kori-900">商品マスター</h1>
            <p className="text-kori-600 mt-1">製品・原材料の管理</p>
          </div>
          <Link href="/items/new">
            <Button className="bg-kori-500 hover:bg-kori-400 text-white shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              新規登録
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-kori-50 rounded-xl p-4 border border-kori-100">
        <div className="flex flex-wrap gap-3">
          <TypeToggle 
            value="ALL" 
            icon={Grid3X3} 
            label="すべて" 
            count={items.length}
          />
          <TypeToggle 
            value="FIN" 
            icon={Package} 
            label="製品" 
            count={items.filter(i => i.type === "FIN").length}
          />
          <TypeToggle 
            value="RAW" 
            icon={Beaker} 
            label="原材料" 
            count={items.filter(i => i.type === "RAW").length}
          />
          <TypeToggle 
            value="WIPNG" 
            icon={Grid3X3} 
            label="仕掛品" 
            count={items.filter(i => i.type === "WIPNG").length}
          />
        </div>
      </div>
      
      {/* Data Table */}
      <div className="bg-white rounded-xl border border-kori-200 shadow-sm overflow-hidden">
        <DataTable 
          columns={columns} 
          data={filteredItems} 
          searchKey="name"
          searchPlaceholder="商品名・コードで検索..."
        />
      </div>
    </div>
  )
}