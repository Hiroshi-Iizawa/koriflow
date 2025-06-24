'use client'

import { ItemFormNew } from "../../../../components/items/item-form-new"
import { useRouter } from "next/navigation"
import { itemSchema } from "../../../../lib/validators/item"
import { z } from "zod"

type ItemFormData = z.infer<typeof itemSchema>

interface EditItemClientProps {
  itemId: string
  initialData: Partial<ItemFormData>
}

export function EditItemClient({ itemId, initialData }: EditItemClientProps) {
  const router = useRouter()

  const handleSubmit = async (data: ItemFormData) => {
    // Convert form data to API format
    const updateData = {
      code: data.code,
      name: data.name,
      type: data.type,
      pack: data.pack,
      janCode: data.janCode || null,
      makerCode: data.makerCode || null,
      brandName: data.brandName || null,
      makerName: data.makerName || null,
      contentVolume: data.contentVolume || null,
      packageSize: data.packageSize || null,
      storageMethod: data.storageMethod || null,
      originCountry: data.countryOfOrigin || null,
      
      // Nutritional info
      energyKcal: data.energy || null,
      proteinG: data.protein || null,
      fatG: data.fat || null,
      carbohydrateG: data.carbs || null,
      sodiumMg: data.sodium || null,
      
      // Allergens
      allergenShrimp: data.allergenShrimp,
      allergenCrab: data.allergenCrab,
      allergenWheat: data.allergenWheat,
      allergenBuckwheat: data.allergenBuckwheat,
      allergenEgg: data.allergenEgg,
      allergenMilk: data.allergenMilk,
      allergenPeanut: data.allergenPeanut,
      allergenWalnut: data.allergenWalnut,
      allergenAbalone: data.allergenAbalone,
      allergenSquid: data.allergenSquid,
      allergenSalmonRoe: data.allergenSalmonRoe,
      allergenOrange: data.allergenOrange,
      allergenCashew: data.allergenCashew,
      allergenKiwi: data.allergenKiwi,
      allergenBeef: data.allergenBeef,
      allergenSesame: data.allergenSesame,
      allergenSalmon: data.allergenSalmon,
      allergenMackerel: data.allergenMackerel,
      allergenSoybean: data.allergenSoybean,
      allergenChicken: data.allergenChicken,
      allergenBanana: data.allergenBanana,
      allergenPork: data.allergenPork,
      allergenMatsutake: data.allergenMatsutake,
      allergenPeach: data.allergenPeach,
      allergenYam: data.allergenYam,
      allergenApple: data.allergenApple,
      allergenGelatin: data.allergenGelatin,
      allergenSeafood: data.allergenSeafood,
      allergenAlmond: data.allergenAlmond,
      
      // Company info
      manufacturerAddress: data.makerAddress || null,
      manufacturerPhone: data.makerPhone || null,
      sellerName: data.sellerName || null,
      sellerAddress: data.sellerAddress || null,
      sellerPhone: data.sellerPhone || null,
      
      // Other
      usageNotes: data.usageNote || null,
    }

    // Make API call to update item
    const response = await fetch(`/api/items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new Error('Failed to update item')
    }

    // Navigate back to items page
    router.push('/items')
    router.refresh()
  }

  const handleCancel = () => {
    router.push('/items')
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-kori-800">商品編集</h1>
        <p className="text-sm text-kori-600 mt-2">
          商品情報を更新・編集
        </p>
      </div>

      <ItemFormNew
        mode="edit"
        item={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}