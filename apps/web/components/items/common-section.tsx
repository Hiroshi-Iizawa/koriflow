'use client'

import { UseFormRegister, FieldErrors } from "react-hook-form"
import { LayoutGrid } from "lucide-react"
import { InputField, Section } from "../ui/form-fields"
import { ItemFormData } from "../../lib/validators/item"

interface CommonSectionProps {
  register: UseFormRegister<ItemFormData>
  errors: FieldErrors<ItemFormData>
  formValues: Partial<ItemFormData>
  onChange: (field: string, value: string) => void
}

export function CommonSection({ register, errors, formValues, onChange }: CommonSectionProps) {
  return (
    <>
      {/* 基本情報 */}
      <Section 
        title="基本情報" 
        icon={<LayoutGrid className="h-5 w-5" />}
      >
        <div className="grid grid-cols-12 gap-4">
          <InputField
            id="code"
            label="商品コード"
            className="col-span-6"
            required
            placeholder="ITEM001"
            {...register("code")}
            error={errors.code?.message}
          />
          
          <InputField
            id="name"
            label="商品名"
            className="col-span-6"
            required
            placeholder="美味しいアイスクリーム"
            {...register("name")}
            error={errors.name?.message}
          />
          
          <InputField
            id="janCode"
            label="JANコード"
            className="col-span-4"
            placeholder="1234567890123"
            {...register("janCode")}
            error={errors.janCode?.message}
          />
          
          <InputField
            id="makerCode" 
            label="メーカーコード"
            className="col-span-4"
            placeholder="MK001"
            {...register("makerCode")}
            error={errors.makerCode?.message}
          />
          
          <InputField
            id="brandName"
            label="ブランド名"
            className="col-span-4"
            placeholder="ハッピーアイス"
            {...register("brandName")}
            error={errors.brandName?.message}
          />
          
          <InputField
            id="makerName"
            label="メーカー名"
            className="col-span-12"
            placeholder="株式会社○○食品"
            {...register("makerName")}
            error={errors.makerName?.message}
          />
        </div>
      </Section>

    </>
  )
}