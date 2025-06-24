'use client'

import { useState, useMemo } from "react"
import { DataTable, Button, Input } from "@koriflow/ui"
import Link from "next/link"
import { columns } from "@app/lots/columns"
import { Plus, Package, Box } from "lucide-react"
import { PackSize } from "@koriflow/db"

type FilterType = "ALL" | PackSize

interface LotsClientProps {
  lots: any[]
}

export function LotsClient({ lots }: LotsClientProps) {
  const [packFilter, setPackFilter] = useState<FilterType>("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLots = useMemo(() => {
    let filtered = lots

    // Pack size filter
    if (packFilter !== "ALL") {
      filtered = filtered.filter(lot => lot.item.pack === packFilter)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lot => 
        lot.lotCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [packFilter, searchTerm, lots])

  const PackToggle = ({ value, label, count }: { value: FilterType, label: string, count: number }) => (
    <Button
      variant={packFilter === value ? "default" : "outline"}
      size="sm"
      onClick={() => setPackFilter(value)}
      className={packFilter === value 
        ? 'bg-kori-500 hover:bg-kori-400 text-white' 
        : 'border-kori-300 text-kori-700 hover:bg-kori-50'
      }
    >
      {label}
      <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs font-semibold ${
        packFilter === value ? 'bg-kori-400/30' : 'bg-kori-100 text-kori-600'
      }`}>
        {count}
      </span>
    </Button>
  )

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-kori-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-kori-900">在庫ロット</h1>
            <p className="text-kori-600 mt-1">在庫ロットの管理と数量追跡</p>
          </div>
          <Link href="/lots/new">
            <Button className="bg-kori-500 hover:bg-kori-400 text-white shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              ロット追加
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="ロットコードまたは商品名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 border-kori-300 focus:border-kori-400"
        />
        
        <div className="flex gap-2">
          <PackToggle 
            value="ALL" 
            label="全て" 
            count={lots.length}
          />
          <PackToggle 
            value="CUP" 
            label="Cup" 
            count={lots.filter(l => l.item.pack === "CUP").length}
          />
          <PackToggle 
            value="BULK2" 
            label="2L" 
            count={lots.filter(l => l.item.pack === "BULK2").length}
          />
          <PackToggle 
            value="BULK4" 
            label="4L" 
            count={lots.filter(l => l.item.pack === "BULK4").length}
          />
        </div>
      </div>
      
      {/* Data Table */}
      <div className="bg-white rounded-xl border border-kori-200 shadow-sm overflow-hidden">
        <DataTable 
          columns={columns} 
          data={filteredLots} 
          searchKey="lotCode"
          searchPlaceholder="ロットを検索..."
          striped
        />
      </div>
    </div>
  )
}