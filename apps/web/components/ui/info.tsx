'use client'

import { ReactNode } from "react"
import { cn } from "@lib/utils"

interface InfoProps {
  label: string
  value: string | number | null | undefined
  icon?: ReactNode
  accent?: boolean
  className?: string
}

export function Info({ label, value, icon, accent = false, className }: InfoProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-sm text-kori-700 tracking-tight">
        {label}
      </label>
      <div className={cn(
        "flex items-center gap-2 text-base font-medium",
        accent ? "text-kori-700 font-semibold" : "text-kori-800"
      )}>
        {icon && <span className="text-kori-600">{icon}</span>}
        <span>
          {value || <span className="text-kori-400">未登録</span>}
        </span>
      </div>
    </div>
  )
}