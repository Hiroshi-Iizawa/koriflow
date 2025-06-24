import { z } from "zod"
import { router, publicProcedure } from "@lib/trpc/server"

const addressCreateSchema = z.object({
  partnerId: z.string(),
  label: z.string().min(1),
  zip: z.string().regex(/^\d{3}-?\d{4}$/, '郵便番号は7桁で入力してください'),
  prefecture: z.string().min(1),
  city: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  contact: z.string().optional(),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
})

const addressUpdateSchema = addressCreateSchema.omit({ partnerId: true }).partial().extend({
  id: z.string(),
})

export const addressRouter = router({
  list: publicProcedure
    .input(z.object({ partnerId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.address.findMany({
        where: { partnerId: input.partnerId },
        orderBy: [
          { isDefault: 'desc' },
          { label: 'asc' },
        ],
      })
    }),

  create: publicProcedure
    .input(addressCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // If this is set as default, unset other defaults
      if (input.isDefault) {
        await ctx.prisma.address.updateMany({
          where: {
            partnerId: input.partnerId,
            isDefault: true,
          },
          data: { isDefault: false },
        })
      }

      // Format zip code
      const formattedZip = input.zip.replace('-', '').replace(/(\d{3})(\d{4})/, '$1-$2')

      return ctx.prisma.address.create({
        data: {
          ...input,
          zip: formattedZip,
        },
      })
    }),

  update: publicProcedure
    .input(addressUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Get current address to check partnerId
      const address = await ctx.prisma.address.findUnique({
        where: { id },
      })

      if (!address) {
        throw new Error('住所が見つかりません')
      }

      // If setting as default, unset other defaults
      if (data.isDefault) {
        await ctx.prisma.address.updateMany({
          where: {
            partnerId: address.partnerId,
            isDefault: true,
            NOT: { id },
          },
          data: { isDefault: false },
        })
      }

      // Format zip code if provided
      if (data.zip) {
        data.zip = data.zip.replace('-', '').replace(/(\d{3})(\d{4})/, '$1-$2')
      }

      return ctx.prisma.address.update({
        where: { id },
        data,
      })
    }),

  setDefault: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const address = await ctx.prisma.address.findUnique({
        where: { id: input.id },
      })

      if (!address) {
        throw new Error('住所が見つかりません')
      }

      // Unset all other defaults for this partner
      await ctx.prisma.address.updateMany({
        where: {
          partnerId: address.partnerId,
          isDefault: true,
        },
        data: { isDefault: false },
      })

      // Set this as default
      return ctx.prisma.address.update({
        where: { id: input.id },
        data: { isDefault: true },
      })
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const address = await ctx.prisma.address.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              salesOrders: true,
              deliveryNotes: true,
            },
          },
        },
      })

      if (!address) {
        throw new Error('住所が見つかりません')
      }

      if (address._count.salesOrders > 0 || address._count.deliveryNotes > 0) {
        throw new Error('使用中の住所は削除できません')
      }

      if (address.isDefault) {
        // Check if there are other addresses
        const otherAddresses = await ctx.prisma.address.count({
          where: {
            partnerId: address.partnerId,
            NOT: { id: input.id },
          },
        })

        if (otherAddresses > 0) {
          throw new Error('デフォルト住所を削除する前に、別の住所をデフォルトに設定してください')
        }
      }

      return ctx.prisma.address.delete({
        where: { id: input.id },
      })
    }),
})