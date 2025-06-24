'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Label,
  useToast,
} from "@koriflow/ui"
import { Globe, Store, Package, Warehouse } from "lucide-react"
import { trpc } from "@lib/trpc/client"
import { createChannelSchema, type CreateChannelInput } from "../../lib/validators/channel"
import { InputField } from "../ui/form-fields"

interface ChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  channel?: Partial<CreateChannelInput>
  mode?: 'create' | 'edit'
}

const channelKindOptions = [
  { value: "SHOPIFY", label: "Shopify", icon: Globe, description: "Shopify ストアとの連携" },
  { value: "EC_CATALOG", label: "ECカタログ", icon: Store, description: "ECカタログサイト向けCSV/API" },
  { value: "WHOLESALE", label: "卸売", icon: Warehouse, description: "卸売業者向けシステム" },
  { value: "POS", label: "POS", icon: Package, description: "店舗POSシステム" },
]

export function ChannelDialog({ open, onOpenChange, onSuccess, channel, mode = 'create' }: ChannelDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateChannelInput>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: channel || {
      code: '',
      name: '',
      kind: 'SHOPIFY',
      endpoint: null,
      apiKey: null,
      isActive: true,
    }
  })

  const selectedKind = watch('kind')
  const isActive = watch('isActive')

  // チャネル作成
  const createChannel = trpc.channel.create.useMutation({
    onSuccess: () => {
      toast({
        title: "チャネルを作成しました",
        variant: "success",
      })
      reset()
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const onSubmit = async (data: CreateChannelInput) => {
    setIsSubmitting(true)
    try {
      await createChannel.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? '新規チャネル作成' : 'チャネル編集'}
            </DialogTitle>
            <DialogDescription>
              商品を販売する外部プラットフォームとの連携を設定します
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* チャネル種別 */}
            <div className="space-y-2">
              <Label htmlFor="kind">チャネル種別</Label>
              <Select
                value={selectedKind}
                onValueChange={(value) => setValue('kind', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {channelKindOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-kori-600">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {errors.kind && (
                <p className="text-sm text-red-500">{errors.kind.message}</p>
              )}
            </div>

            {/* 基本情報 */}
            <InputField
              id="code"
              label="チャネルコード"
              required
              placeholder="SHOPIFY-001"
              {...register("code")}
              error={errors.code?.message}
            />
            
            <InputField
              id="name"
              label="チャネル名"
              required
              placeholder="メインストア"
              {...register("name")}
              error={errors.name?.message}
            />

            {/* API設定 */}
            {selectedKind !== 'WHOLESALE' && (
              <>
                <InputField
                  id="endpoint"
                  label="エンドポイントURL"
                  placeholder="https://example.myshopify.com/api"
                  {...register("endpoint")}
                  error={errors.endpoint?.message}
                />
                
                <InputField
                  id="apiKey"
                  label="APIキー"
                  type="password"
                  placeholder="シークレットキー"
                  {...register("apiKey")}
                  error={errors.apiKey?.message}
                />
              </>
            )}

            {/* 有効/無効 */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
              <Label htmlFor="isActive">
                このチャネルを有効にする
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "作成中..." : (mode === 'create' ? "作成" : "更新")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}