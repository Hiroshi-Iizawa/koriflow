'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox, useToast } from "@koriflow/ui"
import { MapPin, Phone } from "lucide-react"
import { trpc } from "@lib/trpc/client"
import { useRouter } from "next/navigation"

interface AddressDialogProps {
  partnerId: string
  address?: any
  onClose: () => void
}

const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
]

export function AddressDialog({ partnerId, address, onClose }: AddressDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    label: address?.label || "",
    postalCode: address?.postalCode || "",
    prefecture: address?.prefecture || "",
    city: address?.city || "",
    address1: address?.address1 || "",
    address2: address?.address2 || "",
    phone: address?.phone || "",
    isDefault: address?.isDefault || false,
  })

  const createMutation = trpc.address.create.useMutation({
    onSuccess: () => {
      toast({
        title: "住所を追加しました",
        variant: "success",
      })
      router.refresh()
      onClose()
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateMutation = trpc.address.update.useMutation({
    onSuccess: () => {
      toast({
        title: "住所を更新しました",
        variant: "success",
      })
      router.refresh()
      onClose()
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (address) {
        await updateMutation.mutateAsync({
          id: address.id,
          ...formData,
        })
      } else {
        await createMutation.mutateAsync({
          partnerId,
          ...formData,
        })
      }
    } catch (error) {
      alert((error as Error).message)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl text-kori-800">
            <MapPin className="h-5 w-5 text-kori-600" />
            {address ? '住所を編集' : '新しい住所を追加'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="label" className="text-sm text-kori-700 tracking-tight">
              住所ラベル <span className="text-kori-600">*</span>
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="本社、倉庫、配送先など"
              className="h-10 border-kori-300 focus:ring-2 focus:ring-kori-400"
              aria-required="true"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm text-kori-700 tracking-tight">
                郵便番号 <span className="text-kori-600">*</span>
              </Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="123-4567"
                className="h-10 border-kori-300 focus:ring-2 focus:ring-kori-400"
                aria-required="true"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prefecture" className="text-sm text-kori-700 tracking-tight">
                都道府県 <span className="text-kori-600">*</span>
              </Label>
              <Select
                value={formData.prefecture}
                onValueChange={(value) => setFormData({ ...formData, prefecture: value })}
                required
              >
                <SelectTrigger 
                  id="prefecture"
                  className="h-10 border-kori-300 focus:ring-2 focus:ring-kori-400"
                  aria-required="true"
                >
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {prefectures.map((pref) => (
                    <SelectItem key={pref} value={pref}>
                      {pref}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm text-kori-700 tracking-tight">
              市区町村 <span className="text-kori-600">*</span>
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="港区"
              className="h-10 border-kori-300 focus:ring-2 focus:ring-kori-400"
              aria-required="true"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address1" className="text-sm text-kori-700 tracking-tight">
              番地 <span className="text-kori-600">*</span>
            </Label>
            <Input
              id="address1"
              value={formData.address1}
              onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
              placeholder="南青山1-2-3"
              className="h-10 border-kori-300 focus:ring-2 focus:ring-kori-400"
              aria-required="true"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address2" className="text-sm text-kori-700 tracking-tight">
              建物名・部屋番号（任意）
            </Label>
            <Input
              id="address2"
              value={formData.address2}
              onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
              placeholder="青山ビル 5F"
              className="h-10 border-kori-300 focus:ring-2 focus:ring-kori-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm text-kori-700 tracking-tight">
              電話番号（任意）
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kori-600" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="03-1234-5678"
                className="h-10 pl-10 border-kori-300 focus:ring-2 focus:ring-kori-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-kori-50/50 rounded-lg border border-kori-200">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isDefault: checked as boolean })
              }
              className="data-[state=checked]:bg-kori-500 data-[state=checked]:border-kori-500"
            />
            <Label htmlFor="isDefault" className="font-normal text-sm text-kori-700 cursor-pointer">
              デフォルトの住所として設定
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-kori-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="hover:bg-kori-50 border-kori-300"
            >
              キャンセル
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-kori-500 hover:bg-kori-400 text-white"
            >
              {createMutation.isPending || updateMutation.isPending ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}