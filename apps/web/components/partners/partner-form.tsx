'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from "@koriflow/ui"
import { Building2, Mail, Phone } from "lucide-react"
import { trpc } from "@lib/trpc/client"
import { partnerCreateSchema, type PartnerCreateInput } from "@lib/schemas/partner"
import { cn } from "@lib/utils"

type PartnerFormData = PartnerCreateInput

interface PartnerFormProps {
  partner?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function PartnerForm({ partner, onSuccess, onCancel }: PartnerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerCreateSchema),
    defaultValues: {
      code: partner?.code || "",
      name: partner?.name || "",
      kind: partner?.kind || "CUSTOMER",
      email: partner?.email || "",
      phone: partner?.phone || "",
    },
  })

  const createMutation = trpc.partner.create.useMutation({
    onSuccess: () => {
      toast({
        title: "取引先を作成しました",
        variant: "success",
      })
      router.refresh()
      if (onSuccess) onSuccess()
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateMutation = trpc.partner.update.useMutation({
    onSuccess: () => {
      toast({
        title: "取引先を更新しました",
        variant: "success",
      })
      router.refresh()
      if (onSuccess) onSuccess()
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const onSubmit = async (data: PartnerFormData) => {
    setIsSubmitting(true)
    try {
      if (partner) {
        await updateMutation.mutateAsync({
          id: partner.id,
          ...data,
        })
      } else {
        await createMutation.mutateAsync(data)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const kind = watch("kind")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-12 gap-4">
        {/* 取引先コード - 6 columns */}
        <div className="col-span-6">
          <Label htmlFor="code" className="text-sm text-kori-700 tracking-tight">
            取引先コード <span className="text-kori-600">*</span>
          </Label>
          <Input
            id="code"
            {...register("code")}
            placeholder="C001, V001など"
            className={cn(
              "h-10 border-kori-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kori-400 focus-visible:ring-offset-0",
              "dark:bg-kori-900/40 dark:border-kori-700",
              errors.code && "border-red-500"
            )}
            aria-required="true"
            aria-invalid={!!errors.code}
          />
          {errors.code && (
            <p className="text-xs text-red-500 mt-1" role="alert">
              {errors.code.message || "必須項目です"}
            </p>
          )}
        </div>

        {/* 取引先区分 - 6 columns */}
        <div className="col-span-6">
          <Label htmlFor="kind" className="text-sm text-kori-700 tracking-tight">
            取引先区分 <span className="text-kori-600">*</span>
          </Label>
          <Select
            value={kind}
            onValueChange={(value) => setValue("kind", value as any)}
          >
            <SelectTrigger 
              id="kind"
              className={cn(
                "h-10 border-kori-300 focus:ring-2 focus:ring-kori-400",
                "dark:bg-kori-900/40 dark:border-kori-700"
              )}
              aria-required="true"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CUSTOMER">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-kori-600" />
                  得意先
                </div>
              </SelectItem>
              <SelectItem value="VENDOR">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-kori-600" />
                  仕入先
                </div>
              </SelectItem>
              <SelectItem value="BOTH">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-kori-600" />
                  両方
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 取引先名 - 12 columns (full width) */}
        <div className="col-span-12">
          <Label htmlFor="name" className="text-sm text-kori-700 tracking-tight">
            取引先名 <span className="text-kori-600">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="株式会社○○"
            className={cn(
              "h-10 border-kori-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kori-400 focus-visible:ring-offset-0",
              "dark:bg-kori-900/40 dark:border-kori-700",
              errors.name && "border-red-500"
            )}
            aria-required="true"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1" role="alert">
              {errors.name.message || "必須項目です"}
            </p>
          )}
        </div>

        {/* メールアドレス - 6 columns */}
        <div className="col-span-6">
          <Label htmlFor="email" className="text-sm text-kori-700 tracking-tight">
            メールアドレス
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kori-600" />
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="contact@example.com"
              className={cn(
                "h-10 pl-10 border-kori-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kori-400 focus-visible:ring-offset-0",
                "dark:bg-kori-900/40 dark:border-kori-700",
                errors.email && "border-red-500"
              )}
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* 電話番号 - 6 columns */}
        <div className="col-span-6">
          <Label htmlFor="phone" className="text-sm text-kori-700 tracking-tight">
            電話番号
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kori-600" />
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="03-1234-5678"
              className={cn(
                "h-10 pl-10 border-kori-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kori-400 focus-visible:ring-offset-0",
                "dark:bg-kori-900/40 dark:border-kori-700",
                errors.phone && "border-red-500"
              )}
              aria-invalid={!!errors.phone}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-kori-200">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="hover:bg-kori-50 dark:hover:bg-kori-900/20"
          >
            キャンセル
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-kori-500 hover:bg-kori-400 text-white"
        >
          {isSubmitting ? "保存中..." : partner ? "更新" : "作成"}
        </Button>
      </div>
    </form>
  )
}