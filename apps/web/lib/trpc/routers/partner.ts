import { z } from "zod"
import { router, publicProcedure } from "@lib/trpc/server"
import { PartnerKind } from "@prisma/client"
import { partnerCreateSchema, partnerUpdateSchema } from "@lib/schemas/partner"

export const partnerRouter = router({
  list: publicProcedure
    .input(z.object({
      kind: z.nativeEnum(PartnerKind).optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {}
      
      if (input?.kind) {
        where.OR = [
          { kind: input.kind },
          { kind: 'BOTH' }
        ]
      }
      
      if (input?.search) {
        where.AND = {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' } },
            { code: { contains: input.search, mode: 'insensitive' } },
          ]
        }
      }

      const [total, partners] = await Promise.all([
        ctx.prisma.partner.count({ where }),
        ctx.prisma.partner.findMany({
          where,
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1,
            },
            _count: {
              select: {
                addresses: true,
                salesOrders: true,
                purchaseOrders: true,
              },
            },
          },
          orderBy: { name: 'asc' },
          skip: ((input?.page || 1) - 1) * (input?.limit || 20),
          take: input?.limit || 20,
        })
      ])

      return {
        partners,
        total,
        page: input?.page || 1,
        pages: Math.ceil(total / (input?.limit || 20)),
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.partner.findUnique({
        where: { id: input.id },
        include: {
          addresses: {
            orderBy: [
              { isDefault: 'desc' },
              { label: 'asc' },
            ],
          },
          salesOrders: {
            orderBy: { orderedAt: 'desc' },
            take: 10,
            include: {
              _count: {
                select: {
                  lines: true,
                },
              },
            },
          },
          purchaseOrders: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      })
    }),

  getSummary: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const partner = await ctx.prisma.partner.findUnique({
        where: { id: input.id },
        include: {
          addresses: {
            orderBy: [
              { isDefault: 'desc' },
              { label: 'asc' },
            ],
          },
          salesOrders: {
            orderBy: { orderedAt: 'desc' },
            take: 5,
            include: {
              lines: {
                select: {
                  unitPrice: true,
                  quantity: true,
                },
              },
              _count: {
                select: {
                  lines: true,
                },
              },
            },
          },
          purchaseOrders: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      })

      if (!partner) {
        throw new Error('取引先が見つかりません')
      }

      // Calculate total sales amount
      const totalSales = partner.salesOrders.reduce((total, order) => {
        const orderTotal = order.lines.reduce((orderSum, line) => {
          return orderSum + (line.unitPrice * line.quantity)
        }, 0)
        return total + orderTotal
      }, 0)

      // Count pending invoices (confirmed but not shipped orders)
      const pendingInvoices = partner.salesOrders.filter(
        order => order.status === 'CONFIRMED' || order.status === 'PICKED'
      ).length

      // Count unshipped orders
      const unshippedOrders = partner.salesOrders.filter(
        order => ['CONFIRMED', 'PICKED'].includes(order.status)
      ).length

      // Format recent orders for display
      const recentSalesOrders = partner.salesOrders.map(order => {
        const orderTotal = order.lines.reduce((sum, line) => {
          return sum + (line.unitPrice * line.quantity)
        }, 0)
        
        return {
          id: order.id,
          orderNo: order.soNo,
          orderedAt: order.orderedAt.toISOString(),
          status: order.status,
          amount: orderTotal,
          lineCount: order._count.lines,
        }
      })

      const recentPurchaseOrders = partner.purchaseOrders.map(order => ({
        id: order.id,
        orderNo: order.poNo,
        orderedAt: order.createdAt.toISOString(),
        status: 'CONFIRMED', // POs don't have complex status flow
        amount: 0, // PO amount calculation would need lines data
        lineCount: 0,
      }))

      return {
        partner: {
          id: partner.id,
          code: partner.code,
          name: partner.name,
          kind: partner.kind,
          phone: partner.phone,
          email: partner.email,
        },
        addresses: partner.addresses,
        stats: {
          totalSales,
          pendingInvoices,
          unshippedOrders,
          totalOrders: partner.salesOrders.length,
        },
        recentOrders: {
          sales: recentSalesOrders,
          purchase: recentPurchaseOrders,
        },
      }
    }),

  create: publicProcedure
    .input(partnerCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if code already exists
      const existing = await ctx.prisma.partner.findUnique({
        where: { code: input.code },
      })

      if (existing) {
        throw new Error('取引先コードは既に使用されています')
      }

      return ctx.prisma.partner.create({
        data: input,
      })
    }),

  update: publicProcedure
    .input(partnerUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Check if code already exists (if changing)
      if (data.code) {
        const existing = await ctx.prisma.partner.findFirst({
          where: {
            code: data.code,
            NOT: { id },
          },
        })

        if (existing) {
          throw new Error('取引先コードは既に使用されています')
        }
      }

      return ctx.prisma.partner.update({
        where: { id },
        data,
      })
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if partner has any orders
      const partner = await ctx.prisma.partner.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              salesOrders: true,
              purchaseOrders: true,
            },
          },
        },
      })

      if (!partner) {
        throw new Error('取引先が見つかりません')
      }

      if (partner._count.salesOrders > 0 || partner._count.purchaseOrders > 0) {
        throw new Error('取引のある取引先は削除できません')
      }

      return ctx.prisma.partner.delete({
        where: { id: input.id },
      })
    }),
})