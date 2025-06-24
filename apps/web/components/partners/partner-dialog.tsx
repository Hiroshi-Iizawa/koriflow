'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@koriflow/ui"
import { Building2 } from "lucide-react"
import { PartnerForm } from "./partner-form"

interface PartnerDialogProps {
  partner?: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PartnerDialog({ partner, open, onOpenChange }: PartnerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl text-kori-800">
            <Building2 className="h-5 w-5 text-kori-600" />
            {partner ? "取引先を編集" : "新しい取引先を作成"}
          </DialogTitle>
        </DialogHeader>
        <PartnerForm
          partner={partner}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}