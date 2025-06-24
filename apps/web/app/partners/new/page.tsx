'use client'

import { useRouter } from "next/navigation"
import { Button } from "@koriflow/ui"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PartnerForm } from "@components/partners/partner-form"

export default function NewPartnerPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Link href="/partners" className="inline-block mb-6">
        <Button variant="ghost" size="sm" className="hover:bg-kori-50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
      </Link>

      <div className="rounded-lg border border-kori-200 bg-white">
        <div className="p-6 space-y-2">
          <h1 className="text-2xl font-semibold text-kori-800">
            新規取引先作成
          </h1>
          <p className="text-sm text-kori-600">
            得意先または仕入先を登録します
          </p>
        </div>

        <div className="p-6 pt-0">
          <PartnerForm 
            onSuccess={() => router.push('/partners')}
            onCancel={() => router.back()}
          />
        </div>
      </div>
    </div>
  )
}