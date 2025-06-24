'use client'

import { UseFormRegister, FieldErrors } from "react-hook-form"
import { Package2, Image, FileText, Plus, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from "@koriflow/ui"
import { InputField, TextareaField } from "../ui/form-fields"
import { ImageUpload } from "../ui/image-upload"
import { ItemFormData } from "../../lib/validators/item"
import { useState } from "react"

interface BundleSectionProps {
  register: UseFormRegister<ItemFormData>
  errors: FieldErrors<ItemFormData>
  formValues: Partial<ItemFormData>
  onChange: (field: string, value: string) => void
}

interface ComponentItem {
  itemId: string
  qty: number
  name?: string
  code?: string
}

export function BundleSection({ register, errors, formValues, onChange }: BundleSectionProps) {
  // componentsがJSON文字列の場合はパースする
  const initialComponents = (() => {
    if (!formValues.components) return []
    if (typeof formValues.components === 'string') {
      try {
        return JSON.parse(formValues.components)
      } catch {
        return []
      }
    }
    if (Array.isArray(formValues.components)) {
      return formValues.components
    }
    return []
  })()
  
  const [components, setComponents] = useState<ComponentItem[]>(initialComponents)

  const addComponent = () => {
    const newComponent: ComponentItem = {
      itemId: '',
      qty: 1
    }
    const updated = [...components, newComponent]
    setComponents(updated)
    onChange('components', JSON.stringify(updated))
  }

  const updateComponent = (index: number, field: keyof ComponentItem, value: string | number) => {
    const updated = components.map((comp, i) => 
      i === index ? { ...comp, [field]: value } : comp
    )
    setComponents(updated)
    onChange('components', JSON.stringify(updated))
  }

  const removeComponent = (index: number) => {
    const updated = components.filter((_, i) => i !== index)
    setComponents(updated)
    onChange('components', JSON.stringify(updated))
  }

  return (
    <Accordion type="multiple" defaultValue={['components']} className="space-y-4 focus:outline-none focus-within:outline-none mt-6">
      
      {/* 商品画像 */}
      <AccordionItem value="image" className="border border-violet-200 rounded-lg focus:outline-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
          <div className="flex items-center gap-2 text-violet-700 font-semibold">
            <Image className="h-5 w-5 text-violet-600" />
            商品画像
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <ImageUpload
            value={formValues.imageUrl as string}
            onChange={(value) => onChange("imageUrl", value || "")}
            placeholder="セット商品画像をアップロード"
          />
        </AccordionContent>
      </AccordionItem>

      {/* セット構成 */}
      <AccordionItem value="components" className="border border-violet-200 rounded-lg focus:outline-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
          <div className="flex items-center gap-2 text-violet-700 font-semibold">
            <Package2 className="h-5 w-5 text-violet-600" />
            セット構成 ({components.length}個)
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="space-y-4">
            {components.map((component, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-violet-50/50 rounded-lg border border-violet-100">
                <div className="flex-1 grid grid-cols-12 gap-3">
                  <InputField
                    id={`component-item-${index}`}
                    label="商品コード"
                    className="col-span-5"
                    placeholder="ITEM001"
                    value={component.itemId}
                    onChange={(value) => updateComponent(index, 'itemId', value)}
                    required
                  />
                  
                  <InputField
                    id={`component-qty-${index}`}
                    label="数量"
                    className="col-span-3"
                    type="number"
                    min="1"
                    value={component.qty.toString()}
                    onChange={(value) => updateComponent(index, 'qty', parseInt(value) || 0)}
                    required
                  />
                  
                  <div className="col-span-4 flex items-end">
                    <span className="text-sm text-violet-600">
                      {component.name || '商品名を取得中...'}
                    </span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeComponent(index)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addComponent}
              className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              構成商品を追加
            </Button>
            
            {components.length > 0 && (
              <div className="bg-violet-100/50 p-3 rounded-lg">
                <p className="text-sm text-violet-800 font-medium">
                  合計構成: {components.length}種類の商品
                </p>
                <p className="text-xs text-violet-600 mt-1">
                  セット商品の受注時は、各構成商品の在庫から自動で引当されます
                </p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 商品説明 */}
      <AccordionItem value="description" className="border border-violet-200 rounded-lg focus:outline-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
          <div className="flex items-center gap-2 text-violet-700 font-semibold">
            <FileText className="h-5 w-5 text-violet-600" />
            商品説明・特徴
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <TextareaField
            id="productFeature"
            label="商品特徴・説明"
            rows={4}
            placeholder="セット商品の特徴や内容を詳しく説明してください..."
            {...register("productFeature")}
            error={errors.productFeature?.message}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}