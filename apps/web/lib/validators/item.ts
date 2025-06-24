import { z } from "zod"

// 共通フィールド（全タイプで使用）
const commonFields = {
  // 基本情報（必須）
  code: z.string().min(1, "商品コードは必須です").max(50, "商品コードは50文字以内で入力してください"),
  name: z.string().min(1, "商品名は必須です").max(100, "商品名は100文字以内で入力してください"),
  
  // 基本商品情報（任意）
  janCode: z.string().optional().nullable(),
  makerCode: z.string().optional().nullable(),
  brandName: z.string().optional().nullable(),
  makerName: z.string().optional().nullable(),
  
  
  // その他（任意）
  usageNotes: z.string().optional().nullable(),
}

// アレルゲンフィールド（完成品のみ）
const allergenFields = {
  // 特定原材料8品目
  allergenShrimp: z.boolean().default(false),
  allergenCrab: z.boolean().default(false),
  allergenWheat: z.boolean().default(false),
  allergenBuckwheat: z.boolean().default(false),
  allergenEgg: z.boolean().default(false),
  allergenMilk: z.boolean().default(false),
  allergenPeanut: z.boolean().default(false),
  allergenWalnut: z.boolean().default(false),
  
  // 特定原材料に準ずるもの20品目
  allergenAbalone: z.boolean().default(false),
  allergenSquid: z.boolean().default(false),
  allergenSalmonRoe: z.boolean().default(false),
  allergenOrange: z.boolean().default(false),
  allergenCashew: z.boolean().default(false),
  allergenKiwi: z.boolean().default(false),
  allergenBeef: z.boolean().default(false),
  allergenSesame: z.boolean().default(false),
  allergenSalmon: z.boolean().default(false),
  allergenMackerel: z.boolean().default(false),
  allergenSoybean: z.boolean().default(false),
  allergenChicken: z.boolean().default(false),
  allergenBanana: z.boolean().default(false),
  allergenPork: z.boolean().default(false),
  allergenMatsutake: z.boolean().default(false),
  allergenPeach: z.boolean().default(false),
  allergenYam: z.boolean().default(false),
  allergenApple: z.boolean().default(false),
  allergenGelatin: z.boolean().default(false),
  allergenSeafood: z.boolean().default(false),
  allergenAlmond: z.boolean().default(false),
}

// 栄養成分フィールド（完成品のみ）
const nutritionFields = {
  energy: z.number().min(0).optional().nullable(),
  protein: z.number().min(0).optional().nullable(),
  fat: z.number().min(0).optional().nullable(),
  carbs: z.number().min(0).optional().nullable(),
  sodium: z.number().min(0).optional().nullable(),
}

// Discriminated Union Schema
export const itemSchema = z.discriminatedUnion("type", [
  // 完成品 (FIN) Schema
  z.object({
    type: z.literal("FIN"),
    pack: z.enum(["CUP", "BULK2", "BULK4"], {
      required_error: "パックサイズを選択してください",
    }).default("CUP"),
    
    // 完成品専用フィールド
    imageUrl: z.string().optional().nullable(),
    contentVolume: z.string().optional().nullable(),
    packageSize: z.string().optional().nullable(),
    storageMethod: z.string().optional().nullable(),
    countryOfOrigin: z.string().optional().nullable(),
    productFeature: z.string().optional().nullable(),
    
    ...commonFields,
    ...allergenFields,
    ...nutritionFields,
  }),
  
  // 原材料 (RAW) Schema
  z.object({
    type: z.literal("RAW"),
    
    // 原材料専用フィールド
    grade: z.enum(["A", "B", "INDUSTRIAL"], {
      required_error: "等級を選択してください",
    }).optional().nullable(),
    storageCondition: z.string().optional().nullable(),
    leadTimeDays: z.number().min(0).optional().nullable(),
    countryOfOrigin: z.string().optional().nullable(),
    qualityStandard: z.string().optional().nullable(),
    
    ...commonFields,
  }),
  
  // 仕掛品 (WIPNG) Schema
  z.object({
    type: z.literal("WIPNG"),
    
    // 仕掛品専用フィールド
    processStage: z.string().optional().nullable(),
    qualityStatus: z.enum(["OK", "NG", "PENDING"], {
      required_error: "品質ステータスを選択してください",
    }).optional().nullable(),
    storageCondition: z.string().optional().nullable(),
    
    ...commonFields,
  }),
  
  // セット商品 (BUNDLE) Schema
  z.object({
    type: z.literal("BUNDLE"),
    
    // BUNDLE専用フィールド
    imageUrl: z.string().optional().nullable(),
    productFeature: z.string().optional().nullable(),
    
    // セット構成（バリデーションは別途API側で実装）
    components: z.array(z.object({
      itemId: z.string().min(1, "アイテムIDは必須です"),
      qty: z.number().min(0, "数量は0以上である必要があります"),
    })).optional().default([]),
    
    ...commonFields,
  }),
])

export type ItemFormData = z.infer<typeof itemSchema>