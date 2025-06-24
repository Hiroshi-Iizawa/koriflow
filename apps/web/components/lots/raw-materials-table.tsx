'use client'

import { useState, useMemo } from "react"
import { DataTable, Button, Input } from "@koriflow/ui"
import Link from "next/link"
import { rawMaterialsColumns } from "@app/lots/columns-raw"
import { Plus } from "lucide-react"

type FilterType = "ALL" | "EXPIRING"

interface RawMaterialsTableProps {
  lots: any[]
}

export function RawMaterialsTable({ lots }: RawMaterialsTableProps) {
  const [expiryFilter, setExpiryFilter] = useState<FilterType>("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLots = useMemo(() => {
    let filtered = lots.filter(lot => lot.item.type === "RAW")

    // Expiry filter
    if (expiryFilter === "EXPIRING") {
      filtered = filtered.filter(lot => {
        if (!lot.expiryDate) return false
        const now = new Date()
        const expiry = new Date(lot.expiryDate)
        const diffDays = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays <= 30 // Expiring within 30 days
      })
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lot => 
        lot.lotCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [expiryFilter, searchTerm, lots])

  const expiryCounts = useMemo(() => {
    const rawLots = lots.filter(lot => lot.item.type === "RAW")
    const expiringLots = rawLots.filter(lot => {
      if (!lot.expiryDate) return false
      const now = new Date()
      const expiry = new Date(lot.expiryDate)
      const diffDays = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 30
    })
    
    return {
      ALL: rawLots.length,
      EXPIRING: expiringLots.length,
    }
  }, [lots])

  const ExpiryToggle = ({ value, label, count }: { value: FilterType, label: string, count: number }) => (
    <Button
      variant={expiryFilter === value ? "default" : "outline"}
      size="sm"
      onClick={() => setExpiryFilter(value)}
      className={`${expiryFilter === value 
        ? 'bg-kori-500 hover:bg-kori-400 text-white' 
        : 'border-kori-300 text-kori-700 hover:bg-kori-50'
      } transition-all duration-200`}
    >
      {label}
      <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs font-semibold ${
        expiryFilter === value ? 'bg-kori-400/30' : 'bg-kori-100 text-kori-600'
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
            placeholder="原材料またはロットコードで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border-kori-300 focus:border-kori-400"
          />
          
          <div className="flex gap-2">
            <ExpiryToggle value="ALL" label="すべて" count={expiryCounts.ALL} />
            <ExpiryToggle value="EXPIRING" label="要期限管理" count={expiryCounts.EXPIRING} />
          </div>
        </div>
        
        <Link href="/lots/new?type=RAW">
          <Button className="bg-kori-500 hover:bg-kori-400 text-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            原材料ロット追加
          </Button>
        </Link>
      </div>
      
      {/* Data Table */}
      <div className="bg-white rounded-xl border border-kori-200 shadow-sm overflow-hidden">
        <DataTable 
          columns={rawMaterialsColumns} 
          data={filteredLots}
        />
      </div>
    </div>
  )
}