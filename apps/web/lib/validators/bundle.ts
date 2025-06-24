import { z } from "zod"

// Bundle Component Schema
export const bundleComponentSchema = z.object({
  itemId: z.string().min(1, "商品IDは必須です"),
  qty: z.number().min(1, "数量は1以上である必要があります"),
})

// Bundle Creation Input Schema
export const createBundleSchema = z.object({
  // 基本情報
  code: z.string().min(1, "商品コードは必須です").max(50, "商品コードは50文字以内で入力してください"),
  name: z.string().min(1, "商品名は必須です").max(100, "商品名は100文字以内で入力してください"),
  
  // セット商品固有情報
  imageUrl: z.string().optional().nullable(),
  productFeature: z.string().optional().nullable(),
  
  // 基本商品情報（任意）
  janCode: z.string().optional().nullable(),
  makerCode: z.string().optional().nullable(),
  brandName: z.string().optional().nullable(),
  makerName: z.string().optional().nullable(),
  
  // セット構成
  components: z.array(bundleComponentSchema).min(1, "セット構成は最低1つ必要です"),
  
  // その他
  usageNotes: z.string().optional().nullable(),
})

// Bundle Update Input Schema
export const updateBundleSchema = createBundleSchema.partial().extend({
  id: z.string().min(1, "IDは必須です"),
})

// Bundle Query Schema
export const bundleQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["code", "name", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// Bundle Response Schema
export const bundleSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  type: z.literal("BUNDLE"),
  imageUrl: z.string().nullable(),
  productFeature: z.string().nullable(),
  janCode: z.string().nullable(),
  makerCode: z.string().nullable(),
  brandName: z.string().nullable(),
  makerName: z.string().nullable(),
  usageNotes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  components: z.array(z.object({
    id: z.string(),
    itemId: z.string(),
    qty: z.number(),
    component: z.object({
      id: z.string(),
      code: z.string(),
      name: z.string(),
      type: z.enum(["FIN", "RAW", "WIPNG"]),
    }),
  })),
  channelListings: z.array(z.object({
    id: z.string(),
    channelId: z.string(),
    externalSku: z.string(),
    price: z.number().nullable(),
    isActive: z.boolean(),
    channel: z.object({
      id: z.string(),
      code: z.string(),
      name: z.string(),
      kind: z.enum(["SHOPIFY", "EC_CATALOG", "WHOLESALE", "POS"]),
    }),
  })).optional(),
})

// Bundle List Response Schema
export const bundleListSchema = z.object({
  items: z.array(bundleSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

// Bundle Stock Response Schema
export const bundleStockSchema = z.object({
  bundleId: z.string(),
  availableQty: z.number(),
  components: z.array(z.object({
    itemId: z.string(),
    itemCode: z.string(),
    itemName: z.string(),
    requiredQty: z.number(),
    availableQty: z.number(),
    shortfall: z.number(),
  })),
})

// Type exports
export type BundleComponent = z.infer<typeof bundleComponentSchema>
export type CreateBundleInput = z.infer<typeof createBundleSchema>
export type UpdateBundleInput = z.infer<typeof updateBundleSchema>
export type BundleQuery = z.infer<typeof bundleQuerySchema>
export type Bundle = z.infer<typeof bundleSchema>
export type BundleList = z.infer<typeof bundleListSchema>
export type BundleStock = z.infer<typeof bundleStockSchema>