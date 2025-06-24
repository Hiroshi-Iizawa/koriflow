import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../server"
import { TRPCError } from "@trpc/server"
import {
  createChannelSchema,
  updateChannelSchema,
  channelQuerySchema,
  createChannelListingSchema,
  updateChannelListingSchema,
  bulkUpdateChannelListingsSchema,
  channelSyncRequestSchema,
  channelSchema,
  channelListSchema,
  channelListingSchema,
  channelSyncResponseSchema,
} from "../../validators/channel"

export const channelRouter = createTRPCRouter({
  // チャネル作成
  create: protectedProcedure
    .input(createChannelSchema)
    .output(channelSchema)
    .mutation(async ({ ctx, input }) => {
      // コード重複チェック
      const existingChannel = await ctx.prisma.channel.findUnique({
        where: { code: input.code }
      })

      if (existingChannel) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "指定されたチャネルコードは既に使用されています"
        })
      }

      const channel = await ctx.prisma.channel.create({
        data: input,
        include: {
          _count: {
            select: { mappings: true }
          }
        }
      })

      return channel as any
    }),

  // チャネル一覧取得
  list: protectedProcedure
    .input(channelQuerySchema)
    .output(channelListSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, kind, isActive, sortBy, sortOrder } = input

      const where = {
        ...(search && {
          OR: [
            { code: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ]
        }),
        ...(kind && { kind }),
        ...(isActive !== undefined && { isActive }),
      }

      const [items, total] = await Promise.all([
        ctx.prisma.channel.findMany({
          where,
          include: {
            _count: {
              select: { mappings: true }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.prisma.channel.count({ where })
      ])

      return {
        items: items as any,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    }),

  // チャネル詳細取得
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(channelSchema.nullable())
    .query(async ({ ctx, input }) => {
      const channel = await ctx.prisma.channel.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: { mappings: true }
          }
        }
      })

      return channel as any
    }),

  // チャネル更新
  update: protectedProcedure
    .input(updateChannelSchema)
    .output(channelSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // チャネル存在確認
      const existingChannel = await ctx.prisma.channel.findUnique({
        where: { id }
      })

      if (!existingChannel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定されたチャネルが見つかりません"
        })
      }

      // コード重複チェック（自分以外）
      if (updateData.code) {
        const conflictChannel = await ctx.prisma.channel.findFirst({
          where: {
            code: updateData.code,
            id: { not: id }
          }
        })

        if (conflictChannel) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "指定されたチャネルコードは既に使用されています"
          })
        }
      }

      const updatedChannel = await ctx.prisma.channel.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: { mappings: true }
          }
        }
      })

      return updatedChannel as any
    }),

  // チャネル削除
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const channel = await ctx.prisma.channel.findUnique({
        where: { id: input.id }
      })

      if (!channel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定されたチャネルが見つかりません"
        })
      }

      // カスケード削除（PrismaのonDelete: Cascadeで自動）
      await ctx.prisma.channel.delete({
        where: { id: input.id }
      })

      return { success: true }
    }),

  // チャネル商品マッピング作成
  createListing: protectedProcedure
    .input(createChannelListingSchema)
    .output(channelListingSchema)
    .mutation(async ({ ctx, input }) => {
      // チャネル存在確認
      const channel = await ctx.prisma.channel.findUnique({
        where: { id: input.channelId }
      })

      if (!channel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定されたチャネルが見つかりません"
        })
      }

      // 商品存在確認（FINまたはBUNDLEのみ）
      const item = await ctx.prisma.item.findUnique({
        where: { 
          id: input.itemId,
          type: { in: ["FIN", "BUNDLE"] }
        }
      })

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定された商品が見つからないか、販売対象外の商品です"
        })
      }

      // 外部SKU重複チェック
      const existingListing = await ctx.prisma.channelListing.findUnique({
        where: {
          channelId_externalSku: {
            channelId: input.channelId,
            externalSku: input.externalSku,
          }
        }
      })

      if (existingListing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "指定された外部SKUは既に使用されています"
        })
      }

      const listing = await ctx.prisma.channelListing.create({
        data: input,
        include: {
          channel: {
            select: {
              id: true,
              code: true,
              name: true,
              kind: true,
            }
          },
          item: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
            }
          }
        }
      })

      return listing as any
    }),

  // チャネル商品マッピング一覧取得
  getListings: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .output(z.object({
      items: z.array(channelListingSchema),
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const { channelId, page, limit, search, isActive } = input

      const where = {
        channelId,
        ...(search && {
          OR: [
            { externalSku: { contains: search, mode: "insensitive" as const } },
            { item: { 
              OR: [
                { code: { contains: search, mode: "insensitive" as const } },
                { name: { contains: search, mode: "insensitive" as const } },
              ]
            }},
          ]
        }),
        ...(isActive !== undefined && { isActive }),
      }

      const [items, total] = await Promise.all([
        ctx.prisma.channelListing.findMany({
          where,
          include: {
            channel: {
              select: {
                id: true,
                code: true,
                name: true,
                kind: true,
              }
            },
            item: {
              select: {
                id: true,
                code: true,
                name: true,
                type: true,
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.prisma.channelListing.count({ where })
      ])

      return {
        items: items as any,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    }),

  // チャネル商品マッピング更新
  updateListing: protectedProcedure
    .input(updateChannelListingSchema)
    .output(channelListingSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // マッピング存在確認
      const existingListing = await ctx.prisma.channelListing.findUnique({
        where: { id }
      })

      if (!existingListing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定されたマッピングが見つかりません"
        })
      }

      // 外部SKU重複チェック（自分以外）
      if (updateData.externalSku) {
        const conflictListing = await ctx.prisma.channelListing.findFirst({
          where: {
            channelId: existingListing.channelId,
            externalSku: updateData.externalSku,
            id: { not: id }
          }
        })

        if (conflictListing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "指定された外部SKUは既に使用されています"
          })
        }
      }

      const updatedListing = await ctx.prisma.channelListing.update({
        where: { id },
        data: updateData,
        include: {
          channel: {
            select: {
              id: true,
              code: true,
              name: true,
              kind: true,
            }
          },
          item: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
            }
          }
        }
      })

      return updatedListing as any
    }),

  // チャネル商品マッピング一括更新
  bulkUpdateListings: protectedProcedure
    .input(bulkUpdateChannelListingsSchema)
    .output(z.object({ success: z.boolean(), updatedCount: z.number(), createdCount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { channelId, listings } = input

      // チャネル存在確認
      const channel = await ctx.prisma.channel.findUnique({
        where: { id: channelId }
      })

      if (!channel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定されたチャネルが見つかりません"
        })
      }

      // 商品存在確認
      const itemIds = listings.map(l => l.itemId)
      const items = await ctx.prisma.item.findMany({
        where: {
          id: { in: itemIds },
          type: { in: ["FIN", "BUNDLE"] }
        }
      })

      if (items.length !== itemIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "指定された商品の一部が見つからないか、販売対象外です"
        })
      }

      // トランザクションで一括処理
      const result = await ctx.prisma.$transaction(async (tx) => {
        let updatedCount = 0
        let createdCount = 0

        for (const listing of listings) {
          if (listing.id) {
            // 更新
            await tx.channelListing.update({
              where: { id: listing.id },
              data: {
                externalSku: listing.externalSku,
                price: listing.price,
                isActive: listing.isActive,
              }
            })
            updatedCount++
          } else {
            // 新規作成
            await tx.channelListing.create({
              data: {
                channelId,
                itemId: listing.itemId,
                externalSku: listing.externalSku,
                price: listing.price,
                isActive: listing.isActive,
              }
            })
            createdCount++
          }
        }

        return { updatedCount, createdCount }
      })

      return { success: true, ...result }
    }),

  // チャネル商品マッピング削除
  deleteListing: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.channelListing.findUnique({
        where: { id: input.id }
      })

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定されたマッピングが見つかりません"
        })
      }

      await ctx.prisma.channelListing.delete({
        where: { id: input.id }
      })

      return { success: true }
    }),

  // チャネル同期
  syncChannel: protectedProcedure
    .input(channelSyncRequestSchema)
    .output(channelSyncResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const { channelId, itemIds, forceSync } = input

      // チャネル存在確認
      const channel = await ctx.prisma.channel.findUnique({
        where: { id: channelId }
      })

      if (!channel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定されたチャネルが見つかりません"
        })
      }

      if (!channel.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "非アクティブなチャネルは同期できません"
        })
      }

      // 同期対象のマッピング取得
      const listings = await ctx.prisma.channelListing.findMany({
        where: {
          channelId,
          isActive: true,
          ...(itemIds && { itemId: { in: itemIds } }),
        },
        include: {
          item: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
            }
          }
        }
      })

      // 同期処理のシミュレーション（実際の実装では外部API呼び出し）
      const syncResults = await Promise.allSettled(
        listings.map(async (listing) => {
          // チャネル種別に応じた同期処理
          switch (channel.kind) {
            case "SHOPIFY":
              return await syncShopifyListing(channel, listing)
            case "EC_CATALOG":
              return await syncECCatalogListing(channel, listing)
            case "WHOLESALE":
              return await syncWholesaleListing(channel, listing)
            case "POS":
              return await syncPOSListing(channel, listing)
            default:
              throw new Error(`Unsupported channel kind: ${channel.kind}`)
          }
        })
      )

      // 結果集計
      const successCount = syncResults.filter(r => r.status === "fulfilled").length
      const errorCount = syncResults.filter(r => r.status === "rejected").length
      const errors = syncResults
        .map((result, index) => ({
          listing: listings[index],
          result,
        }))
        .filter(({ result }) => result.status === "rejected")
        .map(({ listing, result }) => ({
          itemId: listing.itemId,
          externalSku: listing.externalSku,
          error: (result as PromiseRejectedResult).reason?.message || "Unknown error",
        }))

      return {
        channelId,
        syncedAt: new Date(),
        totalItems: listings.length,
        successCount,
        errorCount,
        errors,
      }
    }),
})

// チャネル別同期処理（実装例）
async function syncShopifyListing(channel: any, listing: any) {
  // Shopify API への実際の同期処理
  // 在庫・価格・商品情報の更新
  return { success: true }
}

async function syncECCatalogListing(channel: any, listing: any) {
  // ECカタログ用CSV/API同期
  return { success: true }
}

async function syncWholesaleListing(channel: any, listing: any) {
  // 卸先システムとの連携
  return { success: true }
}

async function syncPOSListing(channel: any, listing: any) {
  // POSシステムとの同期
  return { success: true }
}