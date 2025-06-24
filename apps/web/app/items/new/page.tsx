'use client'

import { ItemFormNew } from "../../../components/items/item-form-new"
import { useRouter } from "next/navigation"
import { itemSchema } from "../../../lib/validators/item"
import { z } from "zod"

type ItemFormData = z.infer<typeof itemSchema>

export default function NewItemPage() {
  const router = useRouter()

  const handleSubmit = async (data: ItemFormData) => {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create item")
    }

    router.push("/items")
    router.refresh()
  }

  const handleCancel = () => {
    router.push("/items")
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-kori-800">新規商品登録</h1>
        <p className="text-sm text-kori-600 mt-2">
          商品情報を入力してください
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