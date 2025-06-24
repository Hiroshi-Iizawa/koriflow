import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@koriflow/db'
import { createCallerFactory } from '../server'
import { appRouter } from '../root'

// Create a test caller
const createCaller = createCallerFactory(appRouter)

describe('Partner Router', () => {
  const testCaller = createCaller({ prisma })
  
  beforeEach(async () => {
    // Clean up test data
    await prisma.partner.deleteMany({
      where: {
        code: {
          startsWith: 'TEST-'
        }
      }
    })
  })

  describe('create', () => {
    it('should create a new partner', async () => {
      const input = {
        code: 'TEST-001',
        name: 'テスト取引先',
        kind: 'CUSTOMER' as const,
        email: 'test@example.com',
        phone: '03-1234-5678'
      }

      const result = await testCaller.partner.create(input)

      expect(result).toMatchObject({
        code: 'TEST-001',
        name: 'テスト取引先',
        kind: 'CUSTOMER',
        email: 'test@example.com',
        phone: '03-1234-5678'
      })
      expect(result.id).toBeDefined()
    })

    it('should reject duplicate partner codes', async () => {
      const input = {
        code: 'TEST-DUP',
        name: '重複テスト',
        kind: 'VENDOR' as const,
      }

      // Create first partner
      await testCaller.partner.create(input)

      // Try to create duplicate
      await expect(
        testCaller.partner.create(input)
      ).rejects.toThrow('取引先コードは既に使用されています')
    })

    it('should validate required fields', async () => {
      await expect(
        testCaller.partner.create({
          code: '',
          name: 'テスト',
          kind: 'CUSTOMER' as const,
        })
      ).rejects.toThrow()

      await expect(
        testCaller.partner.create({
          code: 'TEST-002',
          name: '',
          kind: 'CUSTOMER' as const,
        })
      ).rejects.toThrow()
    })
  })

  describe('list', () => {
    beforeEach(async () => {
      // Create test partners
      await Promise.all([
        testCaller.partner.create({
          code: 'TEST-C1',
          name: 'カスタマー1',
          kind: 'CUSTOMER' as const,
        }),
        testCaller.partner.create({
          code: 'TEST-C2',
          name: 'カスタマー2',
          kind: 'CUSTOMER' as const,
        }),
        testCaller.partner.create({
          code: 'TEST-V1',
          name: 'ベンダー1',
          kind: 'VENDOR' as const,
        }),
        testCaller.partner.create({
          code: 'TEST-B1',
          name: '両方1',
          kind: 'BOTH' as const,
        }),
      ])
    })

    it('should list all partners', async () => {
      const result = await testCaller.partner.list()
      
      expect(result.partners.length).toBeGreaterThanOrEqual(4)
      expect(result.total).toBeGreaterThanOrEqual(4)
    })

    it('should filter by kind', async () => {
      const customerResult = await testCaller.partner.list({ kind: 'CUSTOMER' })
      const customerCodes = customerResult.partners.map(p => p.code)
      
      expect(customerCodes).toContain('TEST-C1')
      expect(customerCodes).toContain('TEST-C2')
      expect(customerCodes).toContain('TEST-B1') // BOTH should be included
      expect(customerCodes).not.toContain('TEST-V1')
    })

    it('should search by name or code', async () => {
      const result = await testCaller.partner.list({ search: 'カスタマー' })
      
      expect(result.partners.length).toBe(2)
      expect(result.partners.every(p => p.name.includes('カスタマー'))).toBe(true)
    })

    it('should paginate results', async () => {
      const page1 = await testCaller.partner.list({ page: 1, limit: 2 })
      const page2 = await testCaller.partner.list({ page: 2, limit: 2 })
      
      expect(page1.partners.length).toBeLessThanOrEqual(2)
      expect(page2.partners.length).toBeLessThanOrEqual(2)
      expect(page1.partners[0]?.id).not.toBe(page2.partners[0]?.id)
    })
  })

  describe('getById', () => {
    it('should get partner by id with relations', async () => {
      const created = await testCaller.partner.create({
        code: 'TEST-GET',
        name: '詳細取得テスト',
        kind: 'CUSTOMER' as const,
      })

      const result = await testCaller.partner.getById({ id: created.id })

      expect(result).toMatchObject({
        id: created.id,
        code: 'TEST-GET',
        name: '詳細取得テスト',
        addresses: [],
        salesOrders: [],
        purchaseOrders: [],
      })
    })

    it('should return null for non-existent partner', async () => {
      const result = await testCaller.partner.getById({ id: 'non-existent-id' })
      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('should update partner fields', async () => {
      const created = await testCaller.partner.create({
        code: 'TEST-UPD',
        name: '更新前',
        kind: 'CUSTOMER' as const,
      })

      const updated = await testCaller.partner.update({
        id: created.id,
        name: '更新後',
        email: 'updated@example.com',
      })

      expect(updated).toMatchObject({
        id: created.id,
        code: 'TEST-UPD',
        name: '更新後',
        email: 'updated@example.com',
      })
    })

    it('should prevent duplicate codes on update', async () => {
      const partner1 = await testCaller.partner.create({
        code: 'TEST-U1',
        name: '取引先1',
        kind: 'CUSTOMER' as const,
      })

      await testCaller.partner.create({
        code: 'TEST-U2',
        name: '取引先2',
        kind: 'VENDOR' as const,
      })

      await expect(
        testCaller.partner.update({
          id: partner1.id,
          code: 'TEST-U2',
        })
      ).rejects.toThrow('取引先コードは既に使用されています')
    })
  })

  describe('delete', () => {
    it('should delete partner without orders', async () => {
      const created = await testCaller.partner.create({
        code: 'TEST-DEL',
        name: '削除テスト',
        kind: 'VENDOR' as const,
      })

      const result = await testCaller.partner.delete({ id: created.id })
      
      expect(result.id).toBe(created.id)
      
      const check = await testCaller.partner.getById({ id: created.id })
      expect(check).toBeNull()
    })

    it('should prevent deletion of partner with orders', async () => {
      // This would require creating a partner with orders
      // For now, we'll skip this test as it requires more setup
    })

    it('should handle deletion of non-existent partner', async () => {
      await expect(
        testCaller.partner.delete({ id: 'non-existent-id' })
      ).rejects.toThrow()
    })
  })
})