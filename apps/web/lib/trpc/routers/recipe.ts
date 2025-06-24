import { z } from 'zod'
import { router, publicProcedure } from '@lib/trpc/server'

const createRecipeSchema = z.object({
  productId: z.string(),
  yieldPct: z.number().min(0).max(100).optional(),
  version: z.number().min(1).default(1),
  items: z.array(z.object({
    materialId: z.string(),
    qty: z.number().positive(),
    scrapPct: z.number().min(0).max(100).optional(),
  })),
})

const updateRecipeSchema = z.object({
  id: z.string(),
  yieldPct: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  items: z.array(z.object({
    materialId: z.string(),
    qty: z.number().positive(),
    scrapPct: z.number().min(0).max(100).optional(),
  })).optional(),
})

export const recipeRouter = router({
  list: publicProcedure
    .input(z.object({
      productId: z.string().optional(),
      isActive: z.boolean().optional().default(true),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.recipe.findMany({
        where: {
          ...(input.productId && { productId: input.productId }),
          isActive: input.isActive,
        },
        include: {
          product: true,
          items: {
            include: {
              material: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    }),

  byId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.recipe.findUnique({
        where: { id: input },
        include: {
          product: true,
          items: {
            include: {
              material: true,
            },
          },
        },
      })
    }),

  create: publicProcedure
    .input(createRecipeSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate product is FIN type
      const product = await ctx.prisma.item.findUnique({
        where: { id: input.productId },
      })
      
      if (!product || product.type !== 'FIN') {
        throw new Error('Product must be a finished good (FIN)')
      }

      // Validate all materials are RAW type
      const materials = await ctx.prisma.item.findMany({
        where: {
          id: { in: input.items.map(item => item.materialId) },
        },
      })

      const invalidMaterials = materials.filter(m => m.type !== 'RAW')
      if (invalidMaterials.length > 0) {
        throw new Error('All materials must be raw materials (RAW)')
      }

      return ctx.prisma.recipe.create({
        data: {
          productId: input.productId,
          yieldPct: input.yieldPct,
          version: input.version,
          items: {
            create: input.items.map(item => ({
              materialId: item.materialId,
              qty: item.qty,
              scrapPct: item.scrapPct,
            })),
          },
        },
        include: {
          product: true,
          items: {
            include: {
              material: true,
            },
          },
        },
      })
    }),

  update: publicProcedure
    .input(updateRecipeSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, items, ...updateData } = input

      return ctx.prisma.$transaction(async (tx) => {
        // Update recipe
        const recipe = await tx.recipe.update({
          where: { id },
          data: updateData,
        })

        // Update items if provided
        if (items) {
          // Delete existing items
          await tx.recipeItem.deleteMany({
            where: { recipeId: id },
          })

          // Create new items
          await tx.recipeItem.createMany({
            data: items.map(item => ({
              recipeId: id,
              materialId: item.materialId,
              qty: item.qty,
              scrapPct: item.scrapPct,
            })),
          })
        }

        return tx.recipe.findUnique({
          where: { id },
          include: {
            product: true,
            items: {
              include: {
                material: true,
              },
            },
          },
        })
      })
    }),

  delete: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.recipe.delete({
        where: { id: input },
      })
    }),

  getConsumption: publicProcedure
    .input(z.object({
      productId: z.string(),
      plannedQty: z.number().positive(),
    }))
    .query(async ({ ctx, input }) => {
      const recipe = await ctx.prisma.recipe.findFirst({
        where: {
          productId: input.productId,
          isActive: true,
        },
        include: {
          items: {
            include: {
              material: true,
            },
          },
        },
        orderBy: {
          version: 'desc',
        },
      })

      if (!recipe) {
        throw new Error('No active recipe found for this product')
      }

      const yieldFactor = recipe.yieldPct ? recipe.yieldPct / 100 : 1
      const baseQty = input.plannedQty / yieldFactor

      return recipe.items.map(item => {
        const scrapFactor = item.scrapPct ? (100 + item.scrapPct) / 100 : 1
        const requiredQty = Number(item.qty) * baseQty * scrapFactor

        return {
          materialId: item.materialId,
          material: item.material,
          baseQty: Number(item.qty),
          requiredQty,
          scrapPct: item.scrapPct,
        }
      })
    }),
})