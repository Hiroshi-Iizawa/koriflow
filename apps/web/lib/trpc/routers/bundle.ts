import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../server"
import { TRPCError } from "@trpc/server"
import {
  createBundleSchema,
  updateBundleSchema,
  bundleQuerySchema,
  bundleSchema,
  bundleListSchema,
  bundleStockSchema,
} from "../../validators/bundle"

export const bundleRouter = createTRPCRouter({
  // バンドル作成
  create: protectedProcedure
    .input(createBundleSchema)
    .output(bundleSchema)
    .mutation(async ({ ctx, input }) => {
      const { components, ...bundleData } = input

      // コード重複チェック
      const existingItem = await ctx.prisma.item.findUnique({
        where: { code: input.code }
      })

      if (existingItem) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "指定された商品コードは既に使用されています"
        })
      }

      // 構成商品の存在確認
      const componentItems = await ctx.prisma.item.findMany({
        where: {
          id: { in: components.map(c => c.itemId) },
          type: { not: "BUNDLE" } // バンドルの入れ子は禁止
        }
      })

      if (componentItems.length !== components.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "指定された構成商品が見つからないか、バンドル商品が含まれています"
        })
      }

      // トランザクションでバンドルと構成を作成
      const bundle = await ctx.prisma.$transaction(async (tx) => {
        // バンドル商品作成
        const newBundle = await tx.item.create({
          data: {
            ...bundleData,
            type: "BUNDLE",
          }
        })

        // 構成商品関連作成
        await tx.bundleComponent.createMany({
          data: components.map(comp => ({
            bundleId: newBundle.id,
            componentId: comp.itemId,
            qty: comp.qty,
          }))
        })

        return newBundle
      })

      // 作成されたバンドルを構成情報付きで返却
      return await ctx.prisma.item.findUnique({
        where: { id: bundle.id },
        include: {
          bundleComponents: {
            include: {
              component: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  type: true,
                }
              }
            }
          },
          channelListings: {
            include: {
              channel: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  kind: true,
                }
              }
            }
          }
        }
      }) as any
    }),

  // バンドル一覧取得
  list: protectedProcedure
    .input(bundleQuerySchema)
    .output(bundleListSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, sortBy, sortOrder } = input

      const where = {
        type: "BUNDLE" as const,
        ...(search && {
          OR: [
            { code: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ]
        })
      }

      const [items, total] = await Promise.all([
        ctx.prisma.item.findMany({
          where,
          include: {
            bundleComponents: {
              include: {
                component: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    type: true,
                  }
                }
              }
            },
            channelListings: {
              include: {
                channel: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    kind: true,
                  }
                }
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.prisma.item.count({ where })
      ])

      return {
        items: items as any,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    }),

  // バンドル詳細取得
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(bundleSchema.nullable())
    .query(async ({ ctx, input }) => {
      const bundle = await ctx.prisma.item.findUnique({
        where: { 
          id: input.id,
          type: "BUNDLE"
        },
        include: {
          bundleComponents: {
            include: {
              component: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  type: true,
                }
              }
            }
          },
          channelListings: {
            include: {
              channel: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  kind: true,
                }
              }
            }
          }
        }
      })

      return bundle as any
    }),

  // バンドル更新
  update: protectedProcedure
    .input(updateBundleSchema)
    .output(bundleSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, components, ...updateData } = input

      // バンドル存在確認
      const existingBundle = await ctx.prisma.item.findUnique({
        where: { id, type: "BUNDLE" }
      })

      if (!existingBundle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定されたバンドルが見つかりません"
        })
      }

      // コード重複チェック（自分以外）
      if (updateData.code) {
        const conflictItem = await ctx.prisma.item.findFirst({
          where: {
            code: updateData.code,
            id: { not: id }
          }
        })

        if (conflictItem) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "指定された商品コードは既に使用されています"
          })
        }
      }

      // 構成商品の存在確認（指定がある場合）
      if (components) {
        const componentItems = await ctx.prisma.item.findMany({
          where: {
            id: { in: components.map(c => c.itemId) },
            type: { not: "BUNDLE" }
          }
        })

        if (componentItems.length !== components.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "指定された構成商品が見つからないか、バンドル商品が含まれています"
          })
        }
      }

      // トランザクションで更新
      const updatedBundle = await ctx.prisma.$transaction(async (tx) => {
        // バンドル商品更新
        const bundle = await tx.item.update({
          where: { id },
          data: updateData
        })

        // 構成商品更新（指定がある場合）
        if (components) {
          // 既存構成削除
          await tx.bundleComponent.deleteMany({
            where: { bundleId: id }
          })

          // 新構成作成
          await tx.bundleComponent.createMany({
            data: components.map(comp => ({
              bundleId: id,
              componentId: comp.itemId,
              qty: comp.qty,
            }))
          })
        }

        return bundle
      })

      // 更新されたバンドルを構成情報付きで返却
      return await ctx.prisma.item.findUnique({
        where: { id },
        include: {
          bundleComponents: {
            include: {
              component: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  type: true,
                }
              }
            }
          },
          channelListings: {
            include: {
              channel: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  kind: true,
                }
              }
            }
          }
        }
      }) as any
    }),

  // バンドル削除
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // バンドル存在確認
      const bundle = await ctx.prisma.item.findUnique({
        where: { id: input.id, type: "BUNDLE" }
      })

      if (!bundle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定されたバンドルが見つかりません"
        })
      }

      // カスケード削除（PrismaのonDelete: Cascadeで自動）
      await ctx.prisma.item.delete({
        where: { id: input.id }
      })

      return { success: true }
    }),

  // バンドル在庫計算
  calculateStock: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(bundleStockSchema)
    .query(async ({ ctx, input }) => {
      const bundle = await ctx.prisma.item.findUnique({
        where: { id: input.id, type: "BUNDLE" },
        include: {
          bundleComponents: {
            include: {
              component: {
                include: {
                  lots: {
                    select: {
                      qty: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!bundle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定されたバンドルが見つかりません"
        })
      }

      // 各構成商品の在庫状況を計算
      const componentStocks = bundle.bundleComponents.map(comp => {
        const totalStock = comp.component.lots.reduce((sum, lot) => 
          sum + Number(lot.qty), 0)
        const possibleBundles = Math.floor(totalStock / Number(comp.qty))
        
        return {
          itemId: comp.componentId,
          itemCode: comp.component.code,
          itemName: comp.component.name,
          requiredQty: Number(comp.qty),
          availableQty: totalStock,
          shortfall: Math.max(0, Number(comp.qty) - totalStock),
        }
      })

      // バンドル全体で作成可能な数量（最も制約のある構成商品に依存）
      const availableQty = componentStocks.length > 0 
        ? Math.min(...componentStocks.map(comp => 
            Math.floor(comp.availableQty / comp.requiredQty)))
        : 0

      return {
        bundleId: input.id,
        availableQty,
        components: componentStocks,
      }
    }),

  // バンドル構成追加
  addComponent: protectedProcedure
    .input(z.object({
      bundleId: z.string(),
      itemId: z.string(),
      qty: z.number().min(1),
    }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // バンドル存在確認
      const bundle = await ctx.prisma.item.findUnique({
        where: { id: input.bundleId, type: "BUNDLE" }
      })

      if (!bundle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定されたバンドルが見つかりません"
        })
      }

      // 構成商品存在確認
      const component = await ctx.prisma.item.findUnique({
        where: { 
          id: input.itemId,
          type: { not: "BUNDLE" }
        }
      })

      if (!component) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定された構成商品が見つからないか、バンドル商品です"
        })
      }

      // 既存構成確認
      const existing = await ctx.prisma.bundleComponent.findUnique({
        where: {
          bundleId_componentId: {
            bundleId: input.bundleId,
            componentId: input.itemId,
          }
        }
      })

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "この商品は既にバンドルに含まれています"
        })
      }

      await ctx.prisma.bundleComponent.create({
        data: {
          bundleId: input.bundleId,
          componentId: input.itemId,
          qty: input.qty,
        }
      })

      return { success: true }
    }),

  // バンドル構成削除
  removeComponent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const component = await ctx.prisma.bundleComponent.findUnique({
        where: { id: input.id }
      })

      if (!component) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "指定された構成が見つかりません"
        })
      }

      await ctx.prisma.bundleComponent.delete({
        where: { id: input.id }
      })

      return { success: true }
    }),
})