'use client'

import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@koriflow/ui"
import Link from "next/link"
import { useState } from "react"
import { trpc } from "@lib/trpc/client"
import { useRouter } from "next/navigation"

interface RecipeItem {
  materialId: string
  qty: number
  scrapPct?: number
}

export default function NewRecipePage() {
  const router = useRouter()
  const [productId, setProductId] = useState("")
  const [yieldPct, setYieldPct] = useState<number | undefined>()
  const [items, setItems] = useState<RecipeItem[]>([])
  const [newItem, setNewItem] = useState<RecipeItem>({ materialId: "", qty: 0 })

  const { data: products } = trpc.item.list.useQuery({ type: "FIN" })
  const { data: materials } = trpc.item.list.useQuery({ type: "RAW" })
  const createRecipe = trpc.recipe.create.useMutation({
    onSuccess: () => {
      router.push("/recipes")
    },
  })

  const addItem = () => {
    if (newItem.materialId && newItem.qty > 0) {
      setItems([...items, newItem])
      setNewItem({ materialId: "", qty: 0 })
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (productId && items.length > 0) {
      createRecipe.mutate({
        productId,
        yieldPct,
        items,
      })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">新規レシピ作成</h1>
        <Link href="/recipes">
          <Button variant="outline">レシピ一覧へ戻る</Button>
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">レシピ詳細</h2>
          
          <div className="grid gap-4">
            <div>
              <Label htmlFor="product">製品</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="製品を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="yieldPct">歩留率（任意）</Label>
              <Input
                id="yieldPct"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="例: 95.5"
                value={yieldPct || ""}
                onChange={(e) => setYieldPct(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">レシピ原材料</h2>
          
          <div className="grid gap-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>原材料</Label>
                <Select value={newItem.materialId} onValueChange={(value) => setNewItem({...newItem, materialId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="原材料を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials?.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} ({material.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>数量</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder="0.000"
                  value={newItem.qty || ""}
                  onChange={(e) => setNewItem({...newItem, qty: Number(e.target.value)})}
                />
              </div>
              
              <div>
                <Label>廃棄率（任意）</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0.00"
                  value={newItem.scrapPct || ""}
                  onChange={(e) => setNewItem({...newItem, scrapPct: e.target.value ? Number(e.target.value) : undefined})}
                />
              </div>
              
              <div className="flex items-end">
                <Button type="button" onClick={addItem}>原材料を追加</Button>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">追加済み原材料：</h3>
              {items.map((item, index) => {
                const material = materials?.find(m => m.id === item.materialId)
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{material?.name}</span>
                      <span className="text-muted-foreground ml-2">
                        数量: {item.qty}
                        {item.scrapPct && ` | 廃棄率: ${item.scrapPct}%`}
                      </span>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeItem(index)}>
                      削除
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={!productId || items.length === 0 || createRecipe.isPending}
          >
            {createRecipe.isPending ? "作成中..." : "レシピを作成"}
          </Button>
          <Link href="/recipes">
            <Button type="button" variant="outline">キャンセル</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}