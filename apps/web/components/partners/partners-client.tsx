'use client'

import { useState } from "react"
import { DataTable, Button, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, useToast } from "@koriflow/ui"
import { Plus, Building2, Search, Phone, Mail, MapPin, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { PartnerKind } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { trpc } from "@lib/trpc/client"
import { useRouter } from "next/navigation"
import { cn } from "@lib/utils"
import { PartnerDialog } from "./partner-dialog"

interface Partner {
  id: string
  code: string
  name: string
  kind: PartnerKind
  email: string | null
  phone: string | null
  addresses: Array<{
    id: string
    label: string
    prefecture: string
    city: string
  }>
  _count: {
    addresses: number
    salesOrders: number
    purchaseOrders: number
  }
}

interface PartnersClientProps {
  partners: Partner[]
}

const kindLabels: Record<PartnerKind, { label: string; className: string }> = {
  CUSTOMER: { label: "得意先", className: "bg-blue-100 text-blue-700 border-blue-200" },
  VENDOR: { label: "仕入先", className: "bg-green-100 text-green-700 border-green-200" },
  BOTH: { label: "両方", className: "bg-purple-100 text-purple-700 border-purple-200" },
}

export function PartnersClient({ partners }: PartnersClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [kindFilter, setKindFilter] = useState<PartnerKind | "ALL">("ALL")
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [showPartnerDialog, setShowPartnerDialog] = useState(false)

  const deleteMutation = trpc.partner.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "取引先を削除しました",
        variant: "success",
      })
      router.refresh()
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner)
    setShowPartnerDialog(true)
  }

  const handleDelete = async (partner: Partner) => {
    if (!confirm(`取引先「${partner.name}」を削除してもよろしいですか？`)) return
    
    await deleteMutation.mutateAsync({ id: partner.id })
  }

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = !searchTerm || 
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesKind = kindFilter === "ALL" || 
      partner.kind === kindFilter ||
      partner.kind === "BOTH"
    
    return matchesSearch && matchesKind
  })

  const columns: ColumnDef<Partner>[] = [
    {
      accessorKey: "code",
      header: "コード",
      cell: ({ row }) => (
        <Link href={`/partners/${row.original.id}`} className="font-medium text-kori-600 hover:text-kori-800">
          {row.getValue("code")}
        </Link>
      ),
    },
    {
      accessorKey: "name",
      header: "取引先名",
      cell: ({ row }) => (
        <div>
          <Link href={`/partners/${row.original.id}`} className="font-medium text-kori-800 hover:text-kori-600">
            {row.getValue("name")}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            {row.original.email && (
              <span className="flex items-center gap-1 text-xs text-kori-600">
                <Mail className="h-3 w-3 text-kori-600" />
                {row.original.email}
              </span>
            )}
            {row.original.phone && (
              <span className="flex items-center gap-1 text-xs text-kori-600">
                <Phone className="h-3 w-3 text-kori-600" />
                {row.original.phone}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "kind",
      header: "種別",
      cell: ({ row }) => {
        const kind = row.getValue("kind") as PartnerKind
        const config = kindLabels[kind]
        return (
          <Badge 
            variant="outline" 
            className={cn("text-xs", config.className)}
          >
            {config.label}
          </Badge>
        )
      },
    },
    {
      id: "address",
      header: "デフォルト住所",
      cell: ({ row }) => {
        const address = row.original.addresses[0]
        if (!address) return <span className="text-kori-400">未設定</span>
        
        return (
          <div className="flex items-center gap-1 text-sm text-kori-600">
            <MapPin className="h-3 w-3 text-kori-600" />
            <span>{address.prefecture}{address.city}</span>
            <span className="text-kori-500">({address.label})</span>
          </div>
        )
      },
    },
    {
      id: "counts",
      header: "取引実績",
      cell: ({ row }) => {
        const { _count } = row.original
        return (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-kori-600">
              住所: <span className="font-medium">{_count.addresses}</span>
            </span>
            {_count.salesOrders > 0 && (
              <span className="text-blue-600">
                受注: <span className="font-medium">{_count.salesOrders}</span>
              </span>
            )}
            {_count.purchaseOrders > 0 && (
              <span className="text-green-600">
                発注: <span className="font-medium">{_count.purchaseOrders}</span>
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const partner = row.original
        const hasOrders = partner._count.salesOrders > 0 || partner._count.purchaseOrders > 0
        
        return (
          <div className="flex items-center gap-2">
            <Link href={`/partners/${partner.id}`}>
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-kori-50 border-kori-300"
              >
                詳細
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-kori-50"
                >
                  <MoreHorizontal className="h-4 w-4 text-kori-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(partner)}>
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(partner)}
                  disabled={hasOrders}
                  className={hasOrders ? "opacity-50" : "text-red-600"}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                  {hasOrders && " (取引あり)"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kori-800">取引先管理</h1>
          <p className="text-sm text-kori-600 mt-1">
            得意先・仕入先の管理
          </p>
        </div>
        <Link href="/partners/new">
          <Button className="bg-kori-500 hover:bg-kori-400 text-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            新規取引先
          </Button>
        </Link>
      </div>

      {/* フィルター */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border border-kori-200">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kori-600" />
            <Input
              placeholder="取引先名・コードで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-kori-300 focus:ring-2 focus:ring-kori-400"
            />
          </div>
        </div>
        
        <Select value={kindFilter} onValueChange={(value) => setKindFilter(value as PartnerKind | "ALL")}>
          <SelectTrigger className="w-[180px] border-kori-300 focus:ring-2 focus:ring-kori-400">
            <SelectValue placeholder="種別でフィルター" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">すべて</SelectItem>
            <SelectItem value="CUSTOMER">得意先のみ</SelectItem>
            <SelectItem value="VENDOR">仕入先のみ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* データテーブル */}
      <div className="bg-white rounded-xl border border-kori-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredPartners}
        />
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">得意先</span>
          </div>
          <p className="text-2xl font-bold text-blue-800 mt-2">
            {partners.filter(p => p.kind === "CUSTOMER" || p.kind === "BOTH").length}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">仕入先</span>
          </div>
          <p className="text-2xl font-bold text-green-800 mt-2">
            {partners.filter(p => p.kind === "VENDOR" || p.kind === "BOTH").length}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">総住所数</span>
          </div>
          <p className="text-2xl font-bold text-purple-800 mt-2">
            {partners.reduce((sum, p) => sum + p._count.addresses, 0)}
          </p>
        </div>
      </div>

      {/* Partner Dialog */}
      <PartnerDialog
        partner={editingPartner}
        open={showPartnerDialog}
        onOpenChange={(open) => {
          setShowPartnerDialog(open)
          if (!open) setEditingPartner(null)
        }}
      />
    </div>
  )
}