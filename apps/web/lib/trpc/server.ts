import { initTRPC } from '@trpc/server'
import { prisma } from '@koriflow/db'
import superjson from 'superjson'

const t = initTRPC.create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

export const createContext = () => ({
  prisma,
})