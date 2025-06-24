'use client'

import { ItemFormNew } from "../../../components/items/item-form-new"
import { itemSchema } from "../../../lib/validators/item"
import { z } from "zod"
import { useRouter } from "next/navigation"

type ItemFormData = z.infer<typeof itemSchema>

export default function NewImprovedItemPage() {
  const router = useRouter()

  const handleSubmit = async (data: ItemFormData) => {
    // API call would go here
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
        <h1 className="text-2xl font-semibold text-kori-800">新商品登録（改良版）</h1>
        <p className="text-sm text-kori-600 mt-2">
          整理 × 密度 × 快適操作を詰め込んだ商品マスター編集フォーム
        </p>
      </div>

      <ItemFormNew
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}