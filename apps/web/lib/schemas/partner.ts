import { z } from "zod"
import { PartnerKind } from "@prisma/client"

export const partnerCreateSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  kind: z.nativeEnum(PartnerKind),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

export const partnerUpdateSchema = partnerCreateSchema.partial().extend({
  id: z.string(),
})

export type PartnerCreateInput = z.infer<typeof partnerCreateSchema>
export type PartnerUpdateInput = z.infer<typeof partnerUpdateSchema>