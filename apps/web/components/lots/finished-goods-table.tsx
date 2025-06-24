'use client'

import { useState, useMemo } from "react"
import { DataTable, Button, Input } from "@koriflow/ui"
import Link from "next/link"
import { finishedGoodsColumns } from "@app/lots/columns-fin"
import { Plus } from "lucide-react"
import { PackSize } from "@koriflow/db"

type FilterType = "ALL" | PackSize

interface FinishedGoodsTableProps {
  lots: any[]
}

export function FinishedGoodsTable({ lots }: FinishedGoodsTableProps) {
  const [packFilter, setPackFilter] = useState<FilterType>("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLots = useMemo(() => {
    let filtered = lots.filter(lot => lot.item.type === "FIN")

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

  const packCounts = useMemo(() => {
    const finLots = lots.filter(lot => lot.item.type === "FIN")
    return {
      ALL: finLots.length,
      CUP: finLots.filter(l => l.item.pack === "CUP").length,
      BULK2: finLots.filter(l => l.item.pack === "BULK2").length,
      BULK4: finLots.filter(l => l.item.pack === "BULK4").length,
    }
  }, [lots])

  const PackToggle = ({ value, label, count }: { value: FilterType, label: string, count: number }) => (
    <Button
      variant={packFilter === value ? "default" : "outline"}
      size="sm"
      onClick={() => setPackFilter(value)}
      className={`${packFilter === value 
        ? 'bg-kori-500 hover:bg-kori-400 text-white' 
        : 'border-kori-300 text-kori-700 hover:bg-kori-50'
      } transition-all duration-200`}
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-kori-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <Input
            placeholder="製品またはロットコードで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border-kori-300 focus:border-kori-400"
          />
          
          <div className="flex gap-2">
            <PackToggle value="ALL" label="全て" count={packCounts.ALL} />
            <PackToggle value="CUP" label="Cup" count={packCounts.CUP} />
            <PackToggle value="BULK2" label="2L" count={packCounts.BULK2} />
            <PackToggle value="BULK4" label="4L" count={packCounts.BULK4} />
          </div>
        </div>
        
        <Link href="/lots/new?type=FIN">
          <Button className="bg-kori-500 hover:bg-kori-400 text-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            製品ロット追加
          </Button>
        </Link>
      </div>
      
      {/* Data Table */}
      <div className="bg-white rounded-xl border border-kori-200 shadow-sm overflow-hidden">
        <DataTable 
          columns={finishedGoodsColumns} 
          data={filteredLots}
        />
      </div>
    </div>
  )
}