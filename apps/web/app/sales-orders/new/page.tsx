'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@koriflow/ui"
import { trpc } from "@lib/trpc/client"
import { Plus, Trash2, Building2, MapPin } from "lucide-react"

export default function NewSalesOrderPage() {
  const router = useRouter()
  const [partnerId, setPartnerId] = useState("")
  const [shipToId, setShipToId] = useState("")
  const [lines, setLines] = useState<Array<{ itemId: string; qty: number; uom: string }>>([
    { itemId: "", qty: 1, uom: "EA" }
  ])

  const { data: partners } = trpc.partner.list.useQuery({ kind: 'CUSTOMER' })
  const { data: items } = trpc.item.list.useQuery({ type: 'FIN' })
  
  // Watch for partner selection to load addresses
  const { data: addresses } = trpc.address.list.useQuery(
    { partnerId },
    { enabled: !!partnerId }
  )

  const createOrderMutation = trpc.salesOrder.create.useMutation({
    onSuccess: () => {
      router.push('/sales-orders')
    },
  })

  const handleAddLine = () => {
    setLines([...lines, { itemId: "", qty: 1, uom: "EA" }])
  }

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index))
  }

  const handleLineChange = (index: number, field: keyof typeof lines[0], value: any) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setLines(newLines)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validLines = lines.filter(line => line.itemId && line.qty > 0)
    
    if (!partnerId || validLines.length === 0) {
      alert('取引先と少なくとも1つの商品を選択してください')
      return
    }

    await createOrderMutation.mutateAsync({
      partnerId,
      shipToId: shipToId || undefined,
      lines: validLines
    })
  }

  // Auto-select default address when partner changes
  const handlePartnerChange = (value: string) => {
    setPartnerId(value)
    setShipToId("") // Reset address selection
  }

  // When addresses load, auto-select default if exists
  if (addresses && !shipToId) {
    const defaultAddress = addresses.find(addr => addr.isDefault)
    if (defaultAddress) {
      setShipToId(defaultAddress.id)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-kori-800 mb-6">新規受注作成</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Partner Selection */}
        <div className="space-y-2">
          <Label htmlFor="partner">
            <Building2 className="inline-block h-4 w-4 mr-1" />
            取引先（得意先）
          </Label>
          <Select value={partnerId} onValueChange={handlePartnerChange}>
            <SelectTrigger id="partner">
              <SelectValue placeholder="取引先を選択" />
            </SelectTrigger>
            <SelectContent>
              {partners?.map((partner) => (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.name} ({partner.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Shipping Address Selection */}
        {partnerId && addresses && addresses.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="shipTo">
              <MapPin className="inline-block h-4 w-4 mr-1" />
              配送先住所
            </Label>
            <Select value={shipToId} onValueChange={setShipToId}>
              <SelectTrigger id="shipTo">
                <SelectValue placeholder="配送先を選択" />
              </SelectTrigger>
              <SelectContent>
                {addresses.map((address) => (
                  <SelectItem key={address.id} value={address.id}>
                    <div className="flex items-center gap-2">
                      <span>{address.label}</span>
                      {address.isDefault && (
                        <span className="text-xs text-kori-600">(デフォルト)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {address.prefecture}{address.city}{address.address1}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Order Lines */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>商品明細</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
              <Plus className="h-4 w-4 mr-1" />
              明細追加
            </Button>
          </div>

          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  {index === 0 && <Label>商品</Label>}
                  <Select 
                    value={line.itemId} 
                    onValueChange={(value) => handleLineChange(index, 'itemId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="商品を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {items?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-32">
                  {index === 0 && <Label>数量</Label>}
                  <Input
                    type="number"
                    min="1"
                    value={line.qty}
                    onChange={(e) => handleLineChange(index, 'qty', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="w-24">
                  {index === 0 && <Label>単位</Label>}
                  <Input
                    value={line.uom}
                    onChange={(e) => handleLineChange(index, 'uom', e.target.value)}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveLine(index)}
                  disabled={lines.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            キャンセル
          </Button>
          <Button 
            type="submit" 
            disabled={createOrderMutation.isPending}
            className="bg-kori-500 hover:bg-kori-400"
          >
            {createOrderMutation.isPending ? '作成中...' : '受注作成'}
          </Button>
        </div>
      </form>
    </div>
  )
}