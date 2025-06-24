import { z } from "zod"

// Channel Kind Enum Schema
export const channelKindSchema = z.enum(["SHOPIFY", "EC_CATALOG", "WHOLESALE", "POS"])

// Channel Creation Input Schema
export const createChannelSchema = z.object({
  code: z.string().min(1, "チャネルコードは必須です").max(50, "チャネルコードは50文字以内で入力してください"),
  name: z.string().min(1, "チャネル名は必須です").max(100, "チャネル名は100文字以内で入力してください"),
  kind: channelKindSchema,
  endpoint: z.string().url("有効なURLを入力してください").optional().nullable(),
  apiKey: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

// Channel Update Input Schema
export const updateChannelSchema = createChannelSchema.partial().extend({
  id: z.string().min(1, "IDは必須です"),
})

// Channel Query Schema
export const channelQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  kind: channelKindSchema.optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(["code", "name", "kind", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// Channel Listing Creation Schema
export const createChannelListingSchema = z.object({
  channelId: z.string().min(1, "チャネルIDは必須です"),
  itemId: z.string().min(1, "商品IDは必須です"),
  externalSku: z.string().min(1, "外部SKUは必須です").max(100, "外部SKUは100文字以内で入力してください"),
  price: z.number().min(0, "価格は0以上である必要があります").optional().nullable(),
  isActive: z.boolean().default(true),
})

// Channel Listing Update Schema
export const updateChannelListingSchema = createChannelListingSchema.partial().extend({
  id: z.string().min(1, "IDは必須です"),
})

// Channel Listing Bulk Update Schema
export const bulkUpdateChannelListingsSchema = z.object({
  channelId: z.string().min(1, "チャネルIDは必須です"),
  listings: z.array(z.object({
    id: z.string().optional(),
    itemId: z.string().min(1, "商品IDは必須です"),
    externalSku: z.string().min(1, "外部SKUは必須です"),
    price: z.number().min(0).optional().nullable(),
    isActive: z.boolean(),
  })),
})

// Channel Response Schema
export const channelSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  kind: channelKindSchema,
  endpoint: z.string().nullable(),
  apiKey: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z.object({
    mappings: z.number(),
  }).optional(),
})

// Channel List Response Schema
export const channelListSchema = z.object({
  items: z.array(channelSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

// Channel Listing Response Schema
export const channelListingSchema = z.object({
  id: z.string(),
  channelId: z.string(),
  itemId: z.string(),
  externalSku: z.string(),
  price: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  channel: z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    kind: channelKindSchema,
  }),
  item: z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    type: z.enum(["FIN", "RAW", "WIPNG", "BUNDLE"]),
  }),
})

// Channel Sync Request Schema
export const channelSyncRequestSchema = z.object({
  channelId: z.string().min(1, "チャネルIDは必須です"),
  itemIds: z.array(z.string()).optional(), // 指定がない場合は全商品を同期
  forceSync: z.boolean().default(false), // 強制同期フラグ
})

// Channel Sync Response Schema
export const channelSyncResponseSchema = z.object({
  channelId: z.string(),
  syncedAt: z.date(),
  totalItems: z.number(),
  successCount: z.number(),
  errorCount: z.number(),
  errors: z.array(z.object({
    itemId: z.string(),
    externalSku: z.string(),
    error: z.string(),
  })),
})

// Type exports
export type ChannelKind = z.infer<typeof channelKindSchema>
export type CreateChannelInput = z.infer<typeof createChannelSchema>
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>
export type ChannelQuery = z.infer<typeof channelQuerySchema>
export type CreateChannelListingInput = z.infer<typeof createChannelListingSchema>
export type UpdateChannelListingInput = z.infer<typeof updateChannelListingSchema>
export type BulkUpdateChannelListingsInput = z.infer<typeof bulkUpdateChannelListingsSchema>
export type Channel = z.infer<typeof channelSchema>
export type ChannelList = z.infer<typeof channelListSchema>
export type ChannelListing = z.infer<typeof channelListingSchema>
export type ChannelSyncRequest = z.infer<typeof channelSyncRequestSchema>
export type ChannelSyncResponse = z.infer<typeof channelSyncResponseSchema>