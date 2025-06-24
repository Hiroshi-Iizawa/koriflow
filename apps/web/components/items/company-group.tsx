'use client'

import { InputField } from "../ui/form-fields"
import { Building2, MapPin, Phone } from "lucide-react"

interface CompanyGroupProps {
  side: "製造者" | "販売者"
  prefix: "maker" | "seller"
  values: {
    name?: string
    address?: string
    phone?: string
  }
  errors: {
    name?: string
    address?: string
    phone?: string
  }
  onChange: (field: string, value: string) => void
}

export function CompanyGroup({ side, prefix, values, errors, onChange }: CompanyGroupProps) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-medium text-kori-700">
        <Building2 className="h-4 w-4 text-kori-600" />
        {side}情報
      </h3>
      
      <div className="grid grid-cols-12 gap-4">
        <InputField
          id={`${prefix}Name`}
          label="会社名"
          className="col-span-4"
          value={values.name || ""}
          onChange={(value) => onChange(`${prefix}Name`, value)}
          error={errors.name}
          icon={<Building2 className="h-4 w-4" />}
          placeholder="株式会社○○食品"
        />
        
        <InputField
          id={`${prefix}Address`}
          label="住所"
          className="col-span-5"
          value={values.address || ""}
          onChange={(value) => onChange(`${prefix}Address`, value)}
          error={errors.address}
          icon={<MapPin className="h-4 w-4" />}
          placeholder="〒000-0000 東京都○○区..."
        />
        
        <InputField
          id={`${prefix}Phone`}
          label="電話番号"
          className="col-span-3"
          type="tel"
          value={values.phone || ""}
          onChange={(value) => onChange(`${prefix}Phone`, value)}
          error={errors.phone}
          icon={<Phone className="h-4 w-4" />}
          placeholder="03-0000-0000"
        />
      </div>
    </div>
  )
}