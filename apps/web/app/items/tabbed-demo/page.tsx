'use client'

import { ItemFormTabbed } from "../../../components/items/item-form-tabbed"
import { useRouter } from "next/navigation"
import { itemSchema } from "../../../lib/validators/item"
import { z } from "zod"

type ItemFormData = z.infer<typeof itemSchema>

export default function TabbedDemoPage() {
  const router = useRouter()

  const handleSubmit = async (data: ItemFormData) => {
    console.log("Submitting item:", data)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Navigate back to items list
    router.push('/items')
  }

  const handleCancel = () => {
    router.push('/items')
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-kori-800">商品登録 (タブ切り替え版)</h1>
        <p className="text-sm text-kori-600 mt-2">
          「売るもの × 原材料」を1画面で切り替えるUI デモ
        </p>
      </div>

      <ItemFormTabbed
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}