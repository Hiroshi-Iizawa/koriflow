import { z } from 'zod'
import { router, publicProcedure } from '@lib/trpc/server'

export const itemRouter = router({
  list: publicProcedure
    .input(z.object({
      type: z.enum(['FIN', 'RAW', 'WIPNG']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.item.findMany({
        where: {
          ...(input.type && { type: input.type }),
        },
        orderBy: {
          name: 'asc',
        },
      })
    }),

  byId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.item.findUnique({
        where: { id: input },
      })
    }),
})