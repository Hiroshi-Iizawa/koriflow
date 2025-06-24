'use client'

import { UseFormRegister, FieldErrors } from "react-hook-form"
import { Package, Shield, Utensils, FileText } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@koriflow/ui"
import { InputField, SelectField, TextareaField } from "../ui/form-fields"
import { AllergenGrid } from "../allergen-grid"
import { ItemFormData } from "../../lib/validators/item"

interface FinishedGoodsSectionProps {
  register: UseFormRegister<ItemFormData>
  errors: FieldErrors<ItemFormData>
  formValues: Partial<ItemFormData>
  onChange: (field: string, value: string) => void
}

const packOptions = [
  { value: "CUP", label: "カップ (120ml)" },
  { value: "BULK2", label: "バルク2kg" },
  { value: "BULK4", label: "バルク4kg" }
]

const nutrientLabels = [
  { key: 'energy', label: 'エネルギー', unit: 'kcal' },
  { key: 'protein', label: 'たんぱく質', unit: 'g' },
  { key: 'fat', label: '脂質', unit: 'g' },
  { key: 'carbs', label: '炭水化物', unit: 'g' },
  { key: 'sodium', label: '食塩相当量', unit: 'g' }
]

export function FinishedGoodsSection({ register, errors, formValues, onChange }: FinishedGoodsSectionProps) {
  return (
    <Accordion type="multiple" defaultValue={['allergen']} className="space-y-4 focus:outline-none focus-within:outline-none mt-6">
      
      {/* パッケージ情報 */}
      <AccordionItem value="package" className="border border-blue-200 rounded-lg focus:outline-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
          <div className="flex items-center gap-2 text-blue-700 font-semibold">
            <Package className="h-5 w-5 text-blue-600" />
            パッケージ・商品仕様
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-12 gap-4">
            <SelectField
              id="pack"
              label="パック種類"
              className="col-span-4"
              required
              options={packOptions}
              value={formValues.pack as string}
              onChange={(value) => onChange("pack", value)}
              error={errors.pack?.message}
            />
            
            <InputField
              id="contentVolume"
              label="内容量"
              className="col-span-4"
              placeholder="500"
              unit="ml"
              type="text"
              {...register("contentVolume")}
              error={errors.contentVolume?.message}
            />
            
            <InputField
              id="packageSize"
              label="商品規格"
              className="col-span-4"
              placeholder="W100×H150×D50"
              {...register("packageSize")}
              error={errors.packageSize?.message}
            />
            
            <InputField
              id="storageMethod"
              label="保存方法"
              className="col-span-6"
              placeholder="冷凍保存（-18℃以下）"
              {...register("storageMethod")}
              error={errors.storageMethod?.message}
            />
            
            <InputField
              id="countryOfOrigin"
              label="原産国"
              className="col-span-6"
              placeholder="日本"
              {...register("countryOfOrigin")}
              error={errors.countryOfOrigin?.message}
            />
            
            <TextareaField
              id="productFeature"
              label="商品特徴・説明"
              className="col-span-12"
              rows={3}
              placeholder="商品の特徴や説明文を入力してください"
              {...register("productFeature")}
              error={errors.productFeature?.message}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 栄養成分 */}
      <AccordionItem value="nutrition" className="border border-blue-200 rounded-lg focus:outline-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
          <div className="flex items-center gap-2 text-blue-700 font-semibold">
            <Utensils className="h-5 w-5 text-blue-600" />
            栄養成分 (100g当たり)
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-12 gap-4">
            {nutrientLabels.map(({ key, label, unit }) => (
              <InputField
                key={key}
                id={key}
                label={label}
                className="col-span-2"
                type="number"
                step="0.1"
                unit={unit}
                placeholder="0.0"
                {...register(key as keyof ItemFormData)}
                error={errors[key as keyof ItemFormData]?.message}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* アレルゲン情報 */}
      <AccordionItem value="allergen" className="border border-blue-200 rounded-lg focus:outline-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
          <div className="flex items-center gap-2 text-blue-700 font-semibold">
            <Shield className="h-5 w-5 text-blue-600" />
            アレルゲン情報
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <AllergenGrid register={register} />
        </AccordionContent>
      </AccordionItem>

      {/* その他 */}
      <AccordionItem value="others" className="border border-blue-200 rounded-lg focus:outline-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
          <div className="flex items-center gap-2 text-blue-700 font-semibold">
            <FileText className="h-5 w-5 text-blue-600" />
            その他
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <TextareaField
            id="usageNotes"
            label="使用上の注意"
            rows={4}
            placeholder="開封後は冷蔵庫で保存し、お早めにお召し上がりください。"
            {...register("usageNotes")}
            error={errors.usageNotes?.message}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}