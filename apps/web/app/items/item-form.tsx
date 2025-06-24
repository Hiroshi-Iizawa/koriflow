"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Checkbox } from "@koriflow/ui"
import { Item, ItemType } from "@koriflow/db"
import { AllergenGridState } from "@components/allergen-grid-state"

// Serialized version of Item with Decimal fields as strings
type SerializedItem = Omit<Item, 'energyKcal' | 'proteinG' | 'fatG' | 'carbohydrateG' | 'sodiumMg'> & {
  energyKcal: string | null
  proteinG: string | null
  fatG: string | null
  carbohydrateG: string | null
  sodiumMg: string | null
}

interface ItemFormProps {
  initialData?: SerializedItem
}

export function ItemForm({ initialData }: ItemFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // 基本情報
    code: initialData?.code || "",
    name: initialData?.name || "",
    type: initialData?.type || "RAW" as ItemType,
    
    // 商品情報
    janCode: initialData?.janCode || "",
    makerCode: initialData?.makerCode || "",
    brandName: initialData?.brandName || "",
    makerName: initialData?.makerName || "",
    
    // 商品仕様
    contentVolume: initialData?.contentVolume || "",
    packageSize: initialData?.packageSize || "",
    storageMethod: initialData?.storageMethod || "",
    originCountry: initialData?.originCountry || "",
    
    // 栄養成分
    energyKcal: initialData?.energyKcal?.toString() || "",
    proteinG: initialData?.proteinG?.toString() || "",
    fatG: initialData?.fatG?.toString() || "",
    carbohydrateG: initialData?.carbohydrateG?.toString() || "",
    sodiumMg: initialData?.sodiumMg?.toString() || "",
    
    // アレルゲン（特定原材料8品目）
    allergenShrimp: initialData?.allergenShrimp || false,
    allergenCrab: initialData?.allergenCrab || false,
    allergenWheat: initialData?.allergenWheat || false,
    allergenBuckwheat: initialData?.allergenBuckwheat || false,
    allergenEgg: initialData?.allergenEgg || false,
    allergenMilk: initialData?.allergenMilk || false,
    allergenPeanut: initialData?.allergenPeanut || false,
    allergenWalnut: initialData?.allergenWalnut || false,
    
    // アレルゲン（特定原材料に準ずるもの20品目）
    allergenAbalone: initialData?.allergenAbalone || false,
    allergenSquid: initialData?.allergenSquid || false,
    allergenSalmonRoe: initialData?.allergenSalmonRoe || false,
    allergenOrange: initialData?.allergenOrange || false,
    allergenCashew: initialData?.allergenCashew || false,
    allergenKiwi: initialData?.allergenKiwi || false,
    allergenBeef: initialData?.allergenBeef || false,
    allergenSesame: initialData?.allergenSesame || false,
    allergenSalmon: initialData?.allergenSalmon || false,
    allergenMackerel: initialData?.allergenMackerel || false,
    allergenSoybean: initialData?.allergenSoybean || false,
    allergenChicken: initialData?.allergenChicken || false,
    allergenBanana: initialData?.allergenBanana || false,
    allergenPork: initialData?.allergenPork || false,
    allergenMatsutake: initialData?.allergenMatsutake || false,
    allergenPeach: initialData?.allergenPeach || false,
    allergenYam: initialData?.allergenYam || false,
    allergenApple: initialData?.allergenApple || false,
    allergenGelatin: initialData?.allergenGelatin || false,
    allergenSeafood: initialData?.allergenSeafood || false,
    allergenAlmond: initialData?.allergenAlmond || false,
    
    // 企業情報
    manufacturerName: initialData?.manufacturerName || "",
    manufacturerAddress: initialData?.manufacturerAddress || "",
    manufacturerPhone: initialData?.manufacturerPhone || "",
    sellerName: initialData?.sellerName || "",
    sellerAddress: initialData?.sellerAddress || "",
    sellerPhone: initialData?.sellerPhone || "",
    
    // その他
    usageNotes: initialData?.usageNotes || "",
    productFeature: initialData?.productFeature || "",
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData ? `/api/items/${initialData.id}` : "/api/items"
      const method = initialData ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to save item")
      }

      router.push("/items")
      router.refresh()
    } catch (error) {
      console.error("Error saving item:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-4xl">
      {/* 基本情報 */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">基本情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">商品コード *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., FIN-ICECREAM-001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">商品名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., 大地のアイス 登別ミルク"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">商品区分 *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as ItemType })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RAW">原材料</SelectItem>
                <SelectItem value="FIN">製品</SelectItem>
                <SelectItem value="WIPNG">仕掛品/不適合品</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="janCode">JANコード</Label>
            <Input
              id="janCode"
              value={formData.janCode}
              onChange={(e) => setFormData({ ...formData, janCode: e.target.value })}
              placeholder="4573234250214"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="makerCode">メーカーコード</Label>
            <Input
              id="makerCode"
              value={formData.makerCode}
              onChange={(e) => setFormData({ ...formData, makerCode: e.target.value })}
              placeholder="DA000001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandName">ブランド名</Label>
            <Input
              id="brandName"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              placeholder="大地のアイス"
            />
          </div>
        </div>
      </div>

      {/* 商品仕様 */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">商品仕様</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="makerName">メーカー名</Label>
            <Input
              id="makerName"
              value={formData.makerName}
              onChange={(e) => setFormData({ ...formData, makerName: e.target.value })}
              placeholder="株式会社ランベル"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentVolume">内容量</Label>
            <Input
              id="contentVolume"
              value={formData.contentVolume}
              onChange={(e) => setFormData({ ...formData, contentVolume: e.target.value })}
              placeholder="120ml"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageSize">商品規格</Label>
            <Input
              id="packageSize"
              value={formData.packageSize}
              onChange={(e) => setFormData({ ...formData, packageSize: e.target.value })}
              placeholder="120ml x 12個 x 6箱"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storageMethod">保存方法</Label>
            <Input
              id="storageMethod"
              value={formData.storageMethod}
              onChange={(e) => setFormData({ ...formData, storageMethod: e.target.value })}
              placeholder="-18℃以下で保存してください"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="originCountry">原産国</Label>
            <Input
              id="originCountry"
              value={formData.originCountry}
              onChange={(e) => setFormData({ ...formData, originCountry: e.target.value })}
              placeholder="日本"
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="productFeature">商品特徴・説明</Label>
          <Textarea
            id="productFeature"
            value={formData.productFeature}
            onChange={(e) => setFormData({ ...formData, productFeature: e.target.value })}
            placeholder="商品の特徴や説明文を入力してください"
            rows={3}
          />
        </div>
      </div>

      {/* 栄養成分情報 */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">栄養成分情報 (100g当たり)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="energyKcal">エネルギー (kcal)</Label>
            <Input
              id="energyKcal"
              type="number"
              step="0.01"
              value={formData.energyKcal}
              onChange={(e) => setFormData({ ...formData, energyKcal: e.target.value })}
              placeholder="170"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proteinG">たんぱく質 (g)</Label>
            <Input
              id="proteinG"
              type="number"
              step="0.01"
              value={formData.proteinG}
              onChange={(e) => setFormData({ ...formData, proteinG: e.target.value })}
              placeholder="4.3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fatG">脂質 (g)</Label>
            <Input
              id="fatG"
              type="number"
              step="0.01"
              value={formData.fatG}
              onChange={(e) => setFormData({ ...formData, fatG: e.target.value })}
              placeholder="7.8"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carbohydrateG">炭水化物 (g)</Label>
            <Input
              id="carbohydrateG"
              type="number"
              step="0.01"
              value={formData.carbohydrateG}
              onChange={(e) => setFormData({ ...formData, carbohydrateG: e.target.value })}
              placeholder="20.8"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sodiumMg">食塩相当量 (g)</Label>
            <Input
              id="sodiumMg"
              type="number"
              step="0.01"
              value={formData.sodiumMg}
              onChange={(e) => setFormData({ ...formData, sodiumMg: e.target.value })}
              placeholder="0.1"
            />
          </div>
        </div>
      </div>

      {/* アレルゲン情報 */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">アレルゲン情報</h2>
        <AllergenGridState 
          formData={formData}
          onChange={(key, value) => setFormData({ ...formData, [key]: value })}
        />
      </div>

      {/* 企業情報 */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">企業情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">製造者情報</h3>
            <div className="space-y-2">
              <Label htmlFor="manufacturerName">製造者名</Label>
              <Input
                id="manufacturerName"
                value={formData.manufacturerName}
                onChange={(e) => setFormData({ ...formData, manufacturerName: e.target.value })}
                placeholder="株式会社ランベル"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturerAddress">製造者住所</Label>
              <Input
                id="manufacturerAddress"
                value={formData.manufacturerAddress}
                onChange={(e) => setFormData({ ...formData, manufacturerAddress: e.target.value })}
                placeholder="札幌市中央区北3条西会通18丁目35-87"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturerPhone">製造者電話番号</Label>
              <Input
                id="manufacturerPhone"
                value={formData.manufacturerPhone}
                onChange={(e) => setFormData({ ...formData, manufacturerPhone: e.target.value })}
                placeholder="011-299-5614"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">販売者情報</h3>
            <div className="space-y-2">
              <Label htmlFor="sellerName">販売者名</Label>
              <Input
                id="sellerName"
                value={formData.sellerName}
                onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellerAddress">販売者住所</Label>
              <Input
                id="sellerAddress"
                value={formData.sellerAddress}
                onChange={(e) => setFormData({ ...formData, sellerAddress: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellerPhone">販売者電話番号</Label>
              <Input
                id="sellerPhone"
                value={formData.sellerPhone}
                onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* その他 */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">その他</h2>
        <div className="space-y-2">
          <Label htmlFor="usageNotes">使用上の注意</Label>
          <Textarea
            id="usageNotes"
            value={formData.usageNotes}
            onChange={(e) => setFormData({ ...formData, usageNotes: e.target.value })}
            placeholder="使用上の注意事項があれば記載してください"
            rows={3}
          />
        </div>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : (initialData ? "更新" : "作成")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          キャンセル
        </Button>
      </div>
    </form>
  )
}