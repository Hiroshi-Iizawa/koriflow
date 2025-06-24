'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from "@koriflow/ui"
import { Package2, Plus, X, ArrowLeft, Save, Search } from "lucide-react"
import Link from "next/link"
import { trpc } from "@lib/trpc/client"
import { createBundleSchema, type CreateBundleInput } from "../../lib/validators/bundle"
import { InputField, TextareaField } from "../ui/form-fields"
import { ImageUpload } from "../ui/image-upload"
import { Input } from "@koriflow/ui"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@koriflow/ui"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@koriflow/ui"

interface BundleFormProps {
  bundle?: Partial<CreateBundleInput>
  mode?: 'create' | 'edit'
}

export function BundleForm({ bundle, mode = 'create' }: BundleFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchOpen, setSearchOpen] = useState<number | null>(null)
  const [searchValue, setSearchValue] = useState("")
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateBundleInput>({
    resolver: zodResolver(createBundleSchema),
    defaultValues: bundle || {
      code: '',
      name: '',
      imageUrl: null,
      productFeature: null,
      components: [],
    }
  })

  const formValues = watch()
  const components = watch('components') || []

  // 商品検索
  const { data: searchResults } = trpc.item.list.useQuery({
    search: searchValue,
    type: ["FIN", "RAW"], // BUNDLEは除外
    page: 1,
    limit: 10,
  }, {
    enabled: searchValue.length > 0,
  })

  // Bundle作成
  const createBundle = trpc.bundle.create.useMutation({
    onSuccess: () => {
      toast({
        title: "セット商品を作成しました",
        variant: "success",
      })
      router.push('/bundles')
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const onSubmit = async (data: CreateBundleInput) => {
    setIsSubmitting(true)
    try {
      await createBundle.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  // コンポーネント追加
  const addComponent = () => {
    const current = components || []
    setValue('components', [...current, { itemId: '', qty: 1 }])
  }

  // コンポーネント削除
  const removeComponent = (index: number) => {
    const current = components || []
    setValue('components', current.filter((_, i) => i !== index))
  }

  // コンポーネント更新
  const updateComponent = (index: number, field: 'itemId' | 'qty', value: string | number) => {
    const current = [...components]
    if (field === 'qty') {
      current[index].qty = Number(value)
    } else {
      current[index].itemId = value as string
    }
    setValue('components', current)
  }

  // 商品選択
  const selectItem = (index: number, item: any) => {
    updateComponent(index, 'itemId', item.id)
    setSearchOpen(null)
    setSearchValue("")
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/bundles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-kori-800 flex items-center gap-2">
              <Package2 className="h-6 w-6 text-violet-600" />
              {mode === 'create' ? '新規セット商品' : 'セット商品編集'}
            </h1>
            <p className="text-sm text-kori-600 mt-1">
              複数の商品を組み合わせたセット商品を{mode === 'create' ? '作成' : '編集'}します
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 基本情報 */}
        <Card className="border-violet-200">
          <CardHeader className="bg-violet-50/50">
            <CardTitle className="text-lg text-violet-800">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="code"
                label="商品コード"
                required
                placeholder="BUNDLE-001"
                {...register("code")}
                error={errors.code?.message}
              />
              
              <InputField
                id="janCode"
                label="JANコード"
                placeholder="1234567890123"
                {...register("janCode")}
                error={errors.janCode?.message}
              />
            </div>
            
            <InputField
              id="name"
              label="商品名"
              required
              placeholder="アイスクリームギフトセット"
              {...register("name")}
              error={errors.name?.message}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="brandName"
                label="ブランド名"
                placeholder="ハッピーギフト"
                {...register("brandName")}
                error={errors.brandName?.message}
              />
              
              <InputField
                id="makerName"
                label="メーカー名"
                placeholder="株式会社○○食品"
                {...register("makerName")}
                error={errors.makerName?.message}
              />
            </div>

            <TextareaField
              id="productFeature"
              label="商品説明"
              rows={3}
              placeholder="人気フレーバーを詰め合わせたギフトセットです..."
              {...register("productFeature")}
              error={errors.productFeature?.message}
            />

            <div>
              <label className="text-sm font-medium text-kori-700">商品画像</label>
              <ImageUpload
                value={formValues.imageUrl as string}
                onChange={(value) => setValue("imageUrl", value)}
                placeholder="セット商品画像をアップロード"
              />
            </div>
          </CardContent>
        </Card>

        {/* セット構成 */}
        <Card className="border-violet-200">
          <CardHeader className="bg-violet-50/50">
            <CardTitle className="text-lg text-violet-800">セット構成</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {components.map((component, index) => {
              const selectedItem = searchResults?.items.find(item => item.id === component.itemId)
              
              return (
                <div key={index} className="flex items-center gap-3 p-4 bg-violet-50/30 rounded-lg border border-violet-100">
                  <div className="flex-1 grid grid-cols-12 gap-3">
                    <div className="col-span-7">
                      <label className="text-sm font-medium text-kori-700">構成商品</label>
                      <Popover open={searchOpen === index} onOpenChange={(open) => setSearchOpen(open ? index : null)}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {selectedItem ? (
                              <span className="truncate">{selectedItem.code} - {selectedItem.name}</span>
                            ) : (
                              <span className="text-kori-400">商品を選択...</span>
                            )}
                            <Search className="ml-2 h-4 w-4 shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput 
                              placeholder="商品コードまたは名前で検索..." 
                              value={searchValue}
                              onValueChange={setSearchValue}
                            />
                            <CommandList>
                              <CommandEmpty>商品が見つかりません</CommandEmpty>
                              <CommandGroup>
                                {searchResults?.items.map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    onSelect={() => selectItem(index, item)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{item.code}</span>
                                      <span className="text-sm text-kori-600">{item.name}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="col-span-3">
                      <label className="text-sm font-medium text-kori-700">数量</label>
                      <Input
                        type="number"
                        min="1"
                        value={component.qty}
                        onChange={(e) => updateComponent(index, 'qty', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="col-span-2 flex items-end">
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
                  </div>
                </div>
              )
            })}
            
            <Button
              type="button"
              variant="outline"
              onClick={addComponent}
              className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              構成商品を追加
            </Button>
            
            {errors.components && (
              <p className="text-sm text-red-500">{errors.components.message}</p>
            )}
          </CardContent>
        </Card>

        {/* その他 */}
        <Card className="border-violet-200">
          <CardHeader className="bg-violet-50/50">
            <CardTitle className="text-lg text-violet-800">その他</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <TextareaField
              id="usageNotes"
              label="使用上の注意"
              rows={3}
              placeholder="ギフトボックスは別売りです。配送時の取り扱いにご注意ください。"
              {...register("usageNotes")}
              error={errors.usageNotes?.message}
            />
          </CardContent>
        </Card>

        {/* アクション */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/bundles">キャンセル</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "保存中..." : (mode === 'create' ? "作成" : "更新")}
          </Button>
        </div>
      </form>
    </div>
  )
}