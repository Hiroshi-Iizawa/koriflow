import { z } from "zod"
import { router, publicProcedure } from "@lib/trpc/server"

const customerCreateSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const customerUpdateSchema = customerCreateSchema.partial().extend({
  id: z.string(),
})

export const customerRouter = router({
  list: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.customer.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      })
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.customer.findUnique({
        where: { id: input.id },
        include: {
          orders: {
            orderBy: { orderedAt: 'desc' },
            take: 10,
          },
        },
      })
    }),

  create: publicProcedure
    .input(customerCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.customer.create({
        data: input,
      })
    }),

  update: publicProcedure
    .input(customerUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.customer.update({
        where: { id },
        data,
      })
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if customer has any orders
      const customerWithOrders = await ctx.prisma.customer.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      })

      if (customerWithOrders?._count.orders && customerWithOrders._count.orders > 0) {
        throw new Error('Cannot delete customer with existing orders')
      }

      return ctx.prisma.customer.delete({
        where: { id: input.id },
      })
    }),
})