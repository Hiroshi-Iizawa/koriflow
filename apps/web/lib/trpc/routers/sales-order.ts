import { z } from "zod"
import { router, publicProcedure } from "@lib/trpc/server"
import { SOStatus } from "@prisma/client"
import { AllocationService } from "@lib/services/allocation"

const salesLineSchema = z.object({
  itemId: z.string(),
  qty: z.number().positive(),
  uom: z.string().default("EA"),
})

const salesOrderCreateSchema = z.object({
  partnerId: z.string(),
  shipToId: z.string().optional(),
  lines: z.array(salesLineSchema).min(1),
})

const salesOrderUpdateSchema = z.object({
  id: z.string(),
  partnerId: z.string().optional(),
  shipToId: z.string().optional(),
  status: z.nativeEnum(SOStatus).optional(),
  lines: z.array(salesLineSchema.extend({ id: z.string().optional() })).optional(),
})

export const salesOrderRouter = router({
  list: publicProcedure
    .input(z.object({ 
      status: z.nativeEnum(SOStatus).optional(),
      partnerId: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {}
      
      if (input?.status) {
        where.status = input.status
      }
      
      if (input?.partnerId) {
        where.partnerId = input.partnerId
      }

      return ctx.prisma.salesOrder.findMany({
        where,
        include: {
          partner: {
            select: {
              id: true,
              code: true,
              name: true,
              kind: true,
            },
          },
          shipTo: {
            select: {
              id: true,
              label: true,
              prefecture: true,
              city: true,
            },
          },
          lines: {
            include: {
              item: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  pack: true,
                },
              },
              allocations: {
                include: {
                  lot: {
                    select: {
                      lotCode: true,
                      qty: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              lines: true,
            },
          },
        },
        orderBy: { orderedAt: 'desc' },
      })
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.salesOrder.findUnique({
        where: { id: input.id },
        include: {
          partner: true,
          shipTo: true,
          lines: {
            include: {
              item: true,
              allocations: {
                include: {
                  lot: {
                    include: {
                      item: true,
                      location: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    }),

  create: publicProcedure
    .input(salesOrderCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Generate SO number
      const count = await ctx.prisma.salesOrder.count()
      const soNo = `SO-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`

      return ctx.prisma.salesOrder.create({
        data: {
          soNo,
          partnerId: input.partnerId,
          shipToId: input.shipToId,
          status: 'DRAFT',
          lines: {
            create: input.lines.map(line => ({
              itemId: line.itemId,
              qty: line.qty,
              uom: line.uom,
            })),
          },
        },
        include: {
          partner: true,
          shipTo: true,
          lines: {
            include: {
              item: true,
            },
          },
        },
      })
    }),

  update: publicProcedure
    .input(salesOrderUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, lines, ...data } = input
      
      return ctx.prisma.$transaction(async (tx) => {
        // Update sales order
        await tx.salesOrder.update({
          where: { id },
          data,
        })

        // Update lines if provided
        if (lines) {
          // Delete existing lines
          await tx.salesLine.deleteMany({
            where: { soId: id },
          })

          // Create new lines
          await tx.salesLine.createMany({
            data: lines.map(line => ({
              soId: id,
              itemId: line.itemId,
              qty: line.qty,
              uom: line.uom,
            })),
          })
        }

        return tx.salesOrder.findUnique({
          where: { id },
          include: {
            partner: true,
            shipTo: true,
            lines: {
              include: {
                item: true,
              },
            },
          },
        })
      })
    }),

  confirm: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.salesOrder.findUnique({
        where: { id: input.id },
        include: {
          lines: {
            include: {
              item: true,
            },
          },
        },
      })

      if (!order || order.status !== 'DRAFT') {
        throw new Error('Order not found or not in DRAFT status')
      }

      // Use allocation service to allocate inventory
      const allocationService = new AllocationService(ctx.prisma)
      const allocationResult = await allocationService.allocateSalesOrder(input.id)

      return {
        ...allocationResult,
        order: await ctx.prisma.salesOrder.findUnique({
          where: { id: input.id },
          include: {
            partner: true,
            shipTo: true,
            lines: {
              include: {
                item: true,
                allocations: {
                  include: {
                    lot: true,
                  },
                },
              },
            },
          },
        }),
      }
    }),

  commitAllocations: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const allocationService = new AllocationService(ctx.prisma)
      const committedCount = await allocationService.commitAllocations(input.id)
      
      return {
        committedCount,
        order: await ctx.prisma.salesOrder.findUnique({
          where: { id: input.id },
          include: {
            partner: true,
            shipTo: true,
            lines: {
              include: {
                item: true,
                allocations: {
                  include: {
                    lot: true,
                  },
                },
              },
            },
          },
        }),
      }
    }),

  cancel: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.salesOrder.findUnique({
        where: { id: input.id },
      })

      if (!order) {
        throw new Error('Order not found')
      }

      if (order.status === 'SHIPPED' || order.status === 'CLOSED') {
        throw new Error('Cannot cancel shipped or closed orders')
      }

      return ctx.prisma.salesOrder.update({
        where: { id: input.id },
        data: { status: 'CANCELLED' },
      })
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.salesOrder.findUnique({
        where: { id: input.id },
      })

      if (!order || order.status !== 'DRAFT') {
        throw new Error('Can only delete draft orders')
      }

      return ctx.prisma.salesOrder.delete({
        where: { id: input.id },
      })
    }),
})