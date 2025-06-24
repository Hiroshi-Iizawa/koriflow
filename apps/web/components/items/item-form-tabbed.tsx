'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, Button, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from "@koriflow/ui"
import { itemSchema, ItemFormData } from "../../lib/validators/item"
import { CommonSection } from "./common-section"
import { FinishedGoodsSection } from "./finished-goods-section"
import { RawMaterialSection } from "./raw-material-section"
import { BundleSection } from "./bundle-section"
import { cn } from "@lib/utils"

interface ItemFormTabbedProps {
  item?: Partial<ItemFormData>
  onSubmit: (data: ItemFormData) => Promise<void>
  onCancel?: () => void
  mode?: 'create' | 'edit'
}

export function ItemFormTabbed({ item, onSubmit, onCancel, mode = 'create' }: ItemFormTabbedProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(item?.type || "FIN")

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
      type: "FIN",
      pack: "CUP",
      // Allergen defaults (FIN only)
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
      components: [],
      ...item
    }
  })

  const formValues = watch()

  // タブ切り替え時にtypeフィールドを更新
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setValue("type", value as "FIN" | "RAW" | "WIPNG" | "BUNDLE", { shouldDirty: true })
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
          
          {/* タブナビゲーション */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-[600px] bg-kori-50/50 mb-8">
              <TabsTrigger 
                value="FIN" 
                className={cn(
                  "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
                  "hover:bg-blue-50 transition-colors"
                )}
              >
                🛍️ 売るもの (完成品)
              </TabsTrigger>
              <TabsTrigger 
                value="RAW"
                className={cn(
                  "data-[state=active]:bg-teal-500 data-[state=active]:text-white",
                  "hover:bg-teal-50 transition-colors"
                )}
              >
                🥛 原材料
              </TabsTrigger>
              <TabsTrigger 
                value="BUNDLE"
                className={cn(
                  "data-[state=active]:bg-violet-500 data-[state=active]:text-white",
                  "hover:bg-violet-50 transition-colors"
                )}
              >
                📦 セット商品
              </TabsTrigger>
            </TabsList>

            {/* 完成品フォーム */}
            <TabsContent value="FIN" className="space-y-6">
              <CommonSection 
                register={register}
                errors={errors}
                formValues={formValues}
                onChange={handleFieldChange}
              />
              
              <FinishedGoodsSection
                register={register}
                errors={errors}
                formValues={formValues}
                onChange={handleFieldChange}
              />
            </TabsContent>

            {/* 原材料フォーム */}
            <TabsContent value="RAW" className="space-y-6">
              <CommonSection 
                register={register}
                errors={errors}
                formValues={formValues}
                onChange={handleFieldChange}
              />
              
              <RawMaterialSection
                register={register}
                errors={errors}
                formValues={formValues}
                onChange={handleFieldChange}
              />
            </TabsContent>

            {/* セット商品フォーム */}
            <TabsContent value="BUNDLE" className="space-y-6">
              <CommonSection 
                register={register}
                errors={errors}
                formValues={formValues}
                onChange={handleFieldChange}
              />
              
              <BundleSection
                register={register}
                errors={errors}
                formValues={formValues}
                onChange={handleFieldChange}
              />
            </TabsContent>
          </Tabs>

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
              className={cn(
                "text-white transition-colors",
                activeTab === "FIN" 
                  ? "bg-blue-500 hover:bg-blue-400" 
                  : activeTab === "RAW"
                  ? "bg-teal-500 hover:bg-teal-400"
                  : "bg-violet-500 hover:bg-violet-400"
              )}
            >
              {isSubmitting ? "保存中..." : (mode === 'create' ? "作成" : "更新")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}