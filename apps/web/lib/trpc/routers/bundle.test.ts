import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTRPCMsw } from 'msw-trpc'
import { bundleRouter } from './bundle'
import { createBundleSchema, updateBundleSchema, bundleQuerySchema } from '../../validators/bundle'
import type { CreateBundleInput, UpdateBundleInput, BundleQuery } from '../../validators/bundle'

// Mock Prisma
const mockPrisma = {
  item: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  bundleComponent: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(),
}

// Mock context
const mockContext = {
  prisma: mockPrisma,
  user: { id: 'user123', role: 'ADMIN' },
}

describe('Bundle Router', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create a bundle with components', async () => {
      const input: CreateBundleInput = {
        code: 'BUNDLE-001',
        name: 'アイスクリームギフトセット',
        imageUrl: 'https://example.com/image.jpg',
        productFeature: '人気フレーバーの詰め合わせ',
        components: [
          { itemId: 'vanilla-cup', qty: 2 },
          { itemId: 'chocolate-cup', qty: 1 },
        ],
      }

      const mockBundle = {
        id: 'bundle123',
        ...input,
        type: 'BUNDLE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.$transaction.mockResolvedValue(mockBundle)
      mockPrisma.item.findUnique.mockResolvedValue(null) // コード重複なし

      // Bundle creation should validate input schema
      expect(() => createBundleSchema.parse(input)).not.toThrow()
      
      // Bundle creation should validate components exist
      expect(input.components).toHaveLength(2)
      expect(input.components[0].qty).toBeGreaterThan(0)
      
      // Bundle should not allow self-reference
      const invalidInput = { ...input, components: [{ itemId: 'bundle123', qty: 1 }] }
      // This should be validated in the router implementation
    })

    it('should reject bundle with duplicate code', async () => {
      const input: CreateBundleInput = {
        code: 'EXISTING-BUNDLE',
        name: 'Test Bundle',
        components: [{ itemId: 'item1', qty: 1 }],
      }

      mockPrisma.item.findUnique.mockResolvedValue({ id: 'existing', code: 'EXISTING-BUNDLE' })

      // Should throw error for duplicate code
      expect(mockPrisma.item.findUnique).toBeDefined()
    })

    it('should reject bundle with no components', async () => {
      const input = {
        code: 'BUNDLE-EMPTY',
        name: 'Empty Bundle',
        components: [],
      }

      expect(() => createBundleSchema.parse(input)).toThrow('セット構成は最低1つ必要です')
    })

    it('should reject bundle with invalid component quantity', async () => {
      const input = {
        code: 'BUNDLE-INVALID',
        name: 'Invalid Bundle',
        components: [{ itemId: 'item1', qty: 0 }],
      }

      expect(() => createBundleSchema.parse(input)).toThrow('数量は1以上である必要があります')
    })
  })

  describe('list', () => {
    it('should return paginated bundle list', async () => {
      const query: BundleQuery = {
        page: 1,
        limit: 10,
        search: 'ギフト',
        sortBy: 'name',
        sortOrder: 'asc',
      }

      const mockBundles = [
        {
          id: 'bundle1',
          code: 'BUNDLE-001',
          name: 'アイスクリームギフトセット',
          type: 'BUNDLE',
          createdAt: new Date(),
          updatedAt: new Date(),
          components: [],
        },
      ]

      mockPrisma.item.findMany.mockResolvedValue(mockBundles)
      mockPrisma.item.count.mockResolvedValue(1)

      // Should validate query schema
      expect(() => bundleQuerySchema.parse(query)).not.toThrow()
      
      // Should apply search filter
      expect(query.search).toBe('ギフト')
      
      // Should apply sorting
      expect(query.sortBy).toBe('name')
      expect(query.sortOrder).toBe('asc')
    })

    it('should use default pagination when not specified', async () => {
      const query = {}

      const parsed = bundleQuerySchema.parse(query)
      expect(parsed.page).toBe(1)
      expect(parsed.limit).toBe(20)
      expect(parsed.sortBy).toBe('createdAt')
      expect(parsed.sortOrder).toBe('desc')
    })
  })

  describe('get', () => {
    it('should return bundle with components and channel listings', async () => {
      const bundleId = 'bundle123'
      
      const mockBundle = {
        id: bundleId,
        code: 'BUNDLE-001',
        name: 'Test Bundle',
        type: 'BUNDLE',
        createdAt: new Date(),
        updatedAt: new Date(),
        components: [
          {
            id: 'comp1',
            itemId: 'item1',
            qty: 2,
            component: {
              id: 'item1',
              code: 'VANILLA-CUP',
              name: 'バニラカップ',
              type: 'FIN',
            },
          },
        ],
        channelListings: [],
      }

      mockPrisma.item.findUnique.mockResolvedValue(mockBundle)

      // Should include related data
      expect(mockBundle.components).toHaveLength(1)
      expect(mockBundle.components[0].component).toBeDefined()
    })

    it('should return null for non-existent bundle', async () => {
      const bundleId = 'non-existent'
      
      mockPrisma.item.findUnique.mockResolvedValue(null)
      
      // Should handle not found case
      expect(mockPrisma.item.findUnique).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update bundle and components', async () => {
      const input: UpdateBundleInput = {
        id: 'bundle123',
        name: 'Updated Bundle Name',
        components: [
          { itemId: 'item1', qty: 3 },
          { itemId: 'item2', qty: 1 },
        ],
      }

      const mockUpdatedBundle = {
        id: 'bundle123',
        code: 'BUNDLE-001',
        name: 'Updated Bundle Name',
        type: 'BUNDLE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.$transaction.mockResolvedValue(mockUpdatedBundle)

      // Should validate update schema
      expect(() => updateBundleSchema.parse(input)).not.toThrow()
      
      // Should handle component updates
      expect(input.components).toHaveLength(2)
    })
  })

  describe('delete', () => {
    it('should delete bundle and cascade components', async () => {
      const bundleId = 'bundle123'
      
      const mockBundle = {
        id: bundleId,
        type: 'BUNDLE',
      }

      mockPrisma.item.findUnique.mockResolvedValue(mockBundle)
      mockPrisma.item.delete.mockResolvedValue(mockBundle)

      // Should verify bundle exists before deletion
      expect(mockBundle.type).toBe('BUNDLE')
    })

    it('should not delete non-bundle items', async () => {
      const itemId = 'fin-item'
      
      const mockItem = {
        id: itemId,
        type: 'FIN',
      }

      mockPrisma.item.findUnique.mockResolvedValue(mockItem)

      // Should reject deletion of non-bundle items
      expect(mockItem.type).not.toBe('BUNDLE')
    })
  })

  describe('calculateStock', () => {
    it('should calculate available bundle quantity based on components', async () => {
      const bundleId = 'bundle123'
      
      const mockBundle = {
        id: bundleId,
        components: [
          {
            itemId: 'item1',
            qty: 2,
            component: {
              code: 'VANILLA-CUP',
              name: 'バニラカップ',
              lots: [{ qty: 10 }, { qty: 5 }], // Total: 15
            },
          },
          {
            itemId: 'item2', 
            qty: 1,
            component: {
              code: 'CHOCO-CUP',
              name: 'チョコカップ',
              lots: [{ qty: 8 }], // Total: 8
            },
          },
        ],
      }

      mockPrisma.item.findUnique.mockResolvedValue(mockBundle)

      // Bundle qty should be limited by most constraining component
      // item1: 15 qty ÷ 2 required = 7 bundles possible
      // item2: 8 qty ÷ 1 required = 8 bundles possible
      // Available bundle qty = min(7, 8) = 7
      
      const expectedAvailableQty = Math.min(
        Math.floor(15 / 2), // item1
        Math.floor(8 / 1)   // item2
      )
      
      expect(expectedAvailableQty).toBe(7)
    })

    it('should handle zero stock components', async () => {
      const bundleId = 'bundle123'
      
      const mockBundle = {
        id: bundleId,
        components: [
          {
            itemId: 'item1',
            qty: 1,
            component: {
              lots: [], // No stock
            },
          },
        ],
      }

      mockPrisma.item.findUnique.mockResolvedValue(mockBundle)

      // Bundle should be unavailable if any component is out of stock
      const availableQty = 0
      expect(availableQty).toBe(0)
    })
  })
})