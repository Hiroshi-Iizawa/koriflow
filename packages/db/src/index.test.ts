import { describe, it, expect } from 'vitest'
import { prisma } from './index'

describe('Database connection', () => {
  it('should connect to database', async () => {
    // Simple test to verify database connection works
    const result = await prisma.$queryRaw`SELECT 1 as test`
    expect(result).toBeDefined()
  })
})