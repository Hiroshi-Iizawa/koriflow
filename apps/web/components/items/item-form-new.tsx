'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, Button, useToast, Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@koriflow/ui"
import { LayoutGrid, Package, Utensils, Shield, Building2, FileText } from "lucide-react"
import { InputField, SelectField, TextareaField, Section } from "../ui/form-fields"
import { AllergenGrid } from "../allergen-grid"
import { CompanyGroup } from "./company-group"
import { itemSchema } from "../../lib/validators/item"
import { cn } from "@lib/utils"
import { z } from "zod"

type ItemFormData = z.infer<typeof itemSchema>

interface ItemFormProps {
  item?: Partial<ItemFormData>
  onSubmit: (data: ItemFormData) => Promise<void>
  onCancel?: () => void
  mode?: 'create' | 'edit'
}

const typeOptions = [
  { value: "FIN", label: "完成品" },
  { value: "RAW", label: "原材料" },
  { value: "WIPNG", label: "仕掛品" }
]

const packOptions = [
  { value: "CUP", label: "カップ" },
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

export function ItemFormNew({ item, onSubmit, onCancel, mode = 'create' }: ItemFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      pack: "CUP",
      // Allergen defaults
      allergenShrimp: false,
      allergenCrab: false,
      allergenWheat: false,
      allergenBuckwheat: false,
      allergenEgg: false,
      allergenMilk: false,
      allergenPeanut: false,
      allergenWalnut: false,
      allergenAbalone: false,
      allergenSquid: false,
      allergenSalmonRoe: false,
      allergenOrange: false,
      allergenCashew: false,
      allergenKiwi: false,
      allergenBeef: false,
      allergenSesame: false,
      allergenSalmon: false,
      allergenMackerel: false,
      allergenSoybean: false,
      allergenChicken: false,
      allergenBanana: false,
      allergenPork: false,
      allergenMatsutake: false,
      allergenPeach: false,
      allergenYam: false,
      allergenApple: false,
      allergenGelatin: false,
      allergenSeafood: false,
      allergenAlmond: false,
      ...item
    }
  })

  const formValues = watch()

  // JAN code validation
  const validateJANCode = (janCode: string) => {
    if (!janCode || janCode.length !== 13) return false
    
    const digits = janCode.split('').map(Number)
    const checkSum = digits.slice(0, 12).reduce((sum, digit, index) => {
      return sum + digit * (index % 2 === 0 ? 1 : 3)
    }, 0)
    
    const checkDigit = (10 - (checkSum % 10)) % 10
    return checkDigit === digits[12]
  }

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSubmit(onFormSubmit)()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSubmit])

  // ダーティーチェック
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = '変更が保存されていません。ページを離れますか？'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const onFormSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      toast({
        title: mode === 'create' ? "商品を作成しました" : "商品を更新しました",
        variant: "success",
      })
      if (mode === 'create') {
        reset()
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "操作に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (field: string, value: string) => {
    setValue(field as keyof ItemFormData, value, { shouldDirty: true })
  }

  return (
    <Card className="max-w-5xl mx-auto border-kori-200 focus:outline-none focus-within:outline-none">
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="focus-within:outline-none">
          
          {/* ① 基本情報 */}
          <Section 
            title="基本情報" 
            icon={<LayoutGrid className="h-5 w-5" />}
          >
            <div className="grid grid-cols-12 gap-4">
              <InputField
                id="code"
                label="商品コード"
                className="col-span-4"
                required
                placeholder="ITEM001"
                {...register("code")}
                error={errors.code?.message}
              />
              
              <InputField
                id="name"
                label="商品名"
                className="col-span-4"
                required
                placeholder="美味しいアイスクリーム"
                {...register("name")}
                error={errors.name?.message}
              />
              
              <SelectField
                id="type"
                label="商品区分"
                className="col-span-4"
                required
                options={typeOptions}
                value={formValues.type}
                onChange={(value) => handleFieldChange("type", value)}
                error={errors.type?.message}
              />
              
              <InputField
                id="janCode"
                label="JANコード"
                className="col-span-4"
                placeholder="1234567890123"
                {...register("janCode")}
                error={errors.janCode?.message}
                onBlur={() => {
                  const janCode = formValues.janCode
                  if (janCode && !validateJANCode(janCode)) {
                    toast({
                      title: "無効なJANコード",
                      description: "チェックディジットが正しくありません",
                      variant: "destructive",
                    })
                  }
                }}
              />
              
              <InputField
                id="brandName"
                label="ブランド名"
                className="col-span-4"
                placeholder="ハッピーアイス"
                {...register("brandName")}
                error={errors.brandName?.message}
              />
              
              <SelectField
                id="pack"
                label="包装形態"
                className="col-span-4"
                required
                options={packOptions}
                value={formValues.pack}
                onChange={(value) => handleFieldChange("pack", value)}
                error={errors.pack?.message}
              />
            </div>
          </Section>

          {/* アコーディオンセクション */}
          <Accordion type="multiple" defaultValue={['allergen']} className="space-y-4 focus:outline-none focus-within:outline-none mt-6">
            
            {/* ② 仕様 & 栄養 */}
            <AccordionItem value="spec" className="border border-kori-200 rounded-lg focus:outline-none">
              <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
                <div className="flex items-center gap-2 text-kori-700 font-semibold">
                  <Package className="h-5 w-5 text-kori-600" />
                  商品仕様・栄養成分 (任意)
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <div className="grid grid-cols-12 gap-4">
                  <InputField
                    id="contentVolume"
                    label="内容量"
                    className="col-span-3"
                    placeholder="500"
                    unit="ml"
                    type="number"
                    {...register("contentVolume")}
                    error={errors.contentVolume?.message}
                  />
                  
                  <InputField
                    id="packageSize"
                    label="商品規格"
                    className="col-span-3"
                    placeholder="W100×H150×D50"
                    {...register("packageSize")}
                    error={errors.packageSize?.message}
                  />
                  
                  <InputField
                    id="storageMethod"
                    label="保存方法"
                    className="col-span-3"
                    placeholder="冷凍保存"
                    {...register("storageMethod")}
                    error={errors.storageMethod?.message}
                  />
                  
                  <InputField
                    id="countryOfOrigin"
                    label="原産国"
                    className="col-span-3"
                    placeholder="日本"
                    {...register("countryOfOrigin")}
                    error={errors.countryOfOrigin?.message}
                  />
                  
                  {/* 栄養成分 5項目 */}
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

            {/* ③ アレルゲン */}
            <AccordionItem value="allergen" className="border border-kori-200 rounded-lg focus:outline-none">
              <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
                <div className="flex items-center gap-2 text-kori-700 font-semibold">
                  <Shield className="h-5 w-5 text-kori-600" />
                  アレルゲン情報
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <AllergenGrid register={register} />
              </AccordionContent>
            </AccordionItem>

            {/* ④ 企業情報 */}
            <AccordionItem value="company" className="border border-kori-200 rounded-lg focus:outline-none">
              <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
                <div className="flex items-center gap-2 text-kori-700 font-semibold">
                  <Building2 className="h-5 w-5 text-kori-600" />
                  企業情報 (任意)
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-6">
                <CompanyGroup
                  side="製造者"
                  prefix="maker"
                  values={{
                    name: formValues.makerName || "",
                    address: formValues.makerAddress || "",
                    phone: formValues.makerPhone || ""
                  }}
                  errors={{
                    name: errors.makerName?.message,
                    address: errors.makerAddress?.message,
                    phone: errors.makerPhone?.message
                  }}
                  onChange={handleFieldChange}
                />
                
                <CompanyGroup
                  side="販売者"
                  prefix="seller"
                  values={{
                    name: formValues.sellerName || "",
                    address: formValues.sellerAddress || "",
                    phone: formValues.sellerPhone || ""
                  }}
                  errors={{
                    name: errors.sellerName?.message,
                    address: errors.sellerAddress?.message,
                    phone: errors.sellerPhone?.message
                  }}
                  onChange={handleFieldChange}
                />
              </AccordionContent>
            </AccordionItem>

            {/* ⑤ 注意事項 */}
            <AccordionItem value="notice" className="border border-kori-200 rounded-lg focus:outline-none">
              <AccordionTrigger className="px-4 py-3 hover:no-underline focus:outline-none">
                <div className="flex items-center gap-2 text-kori-700 font-semibold">
                  <FileText className="h-5 w-5 text-kori-600" />
                  その他
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <TextareaField
                  id="usageNote"
                  label="使用上の注意"
                  rows={4}
                  placeholder="開封後は冷蔵庫で保存し、お早めにお召し上がりください。"
                  {...register("usageNote")}
                  error={errors.usageNote?.message}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* フッターアクション */}
          <div className="flex justify-end gap-3 pt-6 border-t border-kori-200">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-kori-500 hover:bg-kori-400 text-white"
            >
              {isSubmitting ? "保存中..." : (mode === 'create' ? "作成" : "更新")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}