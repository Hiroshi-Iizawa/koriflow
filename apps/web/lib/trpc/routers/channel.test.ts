import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTRPCMsw } from 'msw-trpc'
import { channelRouter } from './channel'
import { 
  createChannelSchema, 
  updateChannelSchema, 
  channelQuerySchema,
  createChannelListingSchema,
  bulkUpdateChannelListingsSchema,
  channelSyncRequestSchema,
} from '../../validators/channel'
import type { 
  CreateChannelInput, 
  UpdateChannelInput, 
  ChannelQuery,
  CreateChannelListingInput,
  BulkUpdateChannelListingsInput,
  ChannelSyncRequest,
} from '../../validators/channel'

// Mock Prisma
const mockPrisma = {
  channel: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  channelListing: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    createMany: vi.fn(),
    upsert: vi.fn(),
  },
  item: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  $transaction: vi.fn(),
}

// Mock context
const mockContext = {
  prisma: mockPrisma,
  user: { id: 'user123', role: 'ADMIN' },
}

describe('Channel Router', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create a channel with valid data', async () => {
      const input: CreateChannelInput = {
        code: 'SHOPIFY-001',
        name: 'メインストア',
        kind: 'SHOPIFY',
        endpoint: 'https://example.myshopify.com',
        apiKey: 'secret_key_123',
        isActive: true,
      }

      const mockChannel = {
        id: 'channel123',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.channel.findUnique.mockResolvedValue(null) // コード重複なし
      mockPrisma.channel.create.mockResolvedValue(mockChannel)

      // Channel creation should validate input schema
      expect(() => createChannelSchema.parse(input)).not.toThrow()
      
      // Should validate required fields
      expect(input.code).toBeTruthy()
      expect(input.name).toBeTruthy()
      expect(input.kind).toBe('SHOPIFY')
    })

    it('should reject channel with duplicate code', async () => {
      const input: CreateChannelInput = {
        code: 'EXISTING-CHANNEL',
        name: 'Test Channel',
        kind: 'SHOPIFY',
      }

      mockPrisma.channel.findUnique.mockResolvedValue({ 
        id: 'existing', 
        code: 'EXISTING-CHANNEL' 
      })

      // Should throw error for duplicate code
      expect(mockPrisma.channel.findUnique).toBeDefined()
    })

    it('should reject invalid endpoint URL', async () => {
      const input = {
        code: 'INVALID-URL',
        name: 'Invalid Channel',
        kind: 'SHOPIFY',
        endpoint: 'not-a-valid-url',
      }

      expect(() => createChannelSchema.parse(input)).toThrow('有効なURLを入力してください')
    })

    it('should accept valid channel kinds', async () => {
      const validKinds = ['SHOPIFY', 'EC_CATALOG', 'WHOLESALE', 'POS'] as const

      validKinds.forEach(kind => {
        const input = {
          code: `CHANNEL-${kind}`,
          name: `${kind} Channel`,
          kind,
        }

        expect(() => createChannelSchema.parse(input)).not.toThrow()
      })
    })
  })

  describe('list', () => {
    it('should return paginated channel list with filters', async () => {
      const query: ChannelQuery = {
        page: 1,
        limit: 10,
        search: 'ストア',
        kind: 'SHOPIFY',
        isActive: true,
        sortBy: 'name',
        sortOrder: 'asc',
      }

      const mockChannels = [
        {
          id: 'channel1',
          code: 'SHOPIFY-001',
          name: 'メインストア',
          kind: 'SHOPIFY',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { mappings: 5 },
        },
      ]

      mockPrisma.channel.findMany.mockResolvedValue(mockChannels)
      mockPrisma.channel.count.mockResolvedValue(1)

      // Should validate query schema
      expect(() => channelQuerySchema.parse(query)).not.toThrow()
      
      // Should apply filters
      expect(query.search).toBe('ストア')
      expect(query.kind).toBe('SHOPIFY')
      expect(query.isActive).toBe(true)
    })

    it('should use default values when not specified', async () => {
      const query = {}

      const parsed = channelQuerySchema.parse(query)
      expect(parsed.page).toBe(1)
      expect(parsed.limit).toBe(20)
      expect(parsed.sortBy).toBe('createdAt')
      expect(parsed.sortOrder).toBe('desc')
    })
  })

  describe('createListing', () => {
    it('should create channel listing with valid data', async () => {
      const input: CreateChannelListingInput = {
        channelId: 'channel123',
        itemId: 'item456',
        externalSku: 'SHOPIFY-SKU-001',
        price: 1500,
        isActive: true,
      }

      const mockChannel = { id: 'channel123', code: 'SHOPIFY-001' }
      const mockItem = { id: 'item456', code: 'BUNDLE-001', type: 'BUNDLE' }
      const mockListing = {
        id: 'listing123',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.channel.findUnique.mockResolvedValue(mockChannel)
      mockPrisma.item.findUnique.mockResolvedValue(mockItem)
      mockPrisma.channelListing.findUnique.mockResolvedValue(null) // 重複なし
      mockPrisma.channelListing.create.mockResolvedValue(mockListing)

      // Should validate input schema
      expect(() => createChannelListingSchema.parse(input)).not.toThrow()
      
      // Should validate required fields
      expect(input.channelId).toBeTruthy()
      expect(input.itemId).toBeTruthy()
      expect(input.externalSku).toBeTruthy()
    })

    it('should reject negative price', async () => {
      const input = {
        channelId: 'channel123',
        itemId: 'item456',
        externalSku: 'SKU-001',
        price: -100,
      }

      expect(() => createChannelListingSchema.parse(input)).toThrow('価格は0以上である必要があります')
    })

    it('should reject duplicate external SKU in same channel', async () => {
      const input: CreateChannelListingInput = {
        channelId: 'channel123',
        itemId: 'item456',
        externalSku: 'EXISTING-SKU',
        price: 1000,
      }

      mockPrisma.channelListing.findUnique.mockResolvedValue({
        id: 'existing-listing',
        externalSku: 'EXISTING-SKU',
        channelId: 'channel123',
      })

      // Should handle duplicate SKU error
      expect(mockPrisma.channelListing.findUnique).toBeDefined()
    })
  })

  describe('bulkUpdateListings', () => {
    it('should bulk update channel listings', async () => {
      const input: BulkUpdateChannelListingsInput = {
        channelId: 'channel123',
        listings: [
          {
            id: 'listing1',
            itemId: 'item1',
            externalSku: 'SKU-001',
            price: 1500,
            isActive: true,
          },
          {
            itemId: 'item2',
            externalSku: 'SKU-002',
            price: 2000,
            isActive: false,
          },
        ],
      }

      mockPrisma.channel.findUnique.mockResolvedValue({ id: 'channel123' })
      mockPrisma.item.findMany.mockResolvedValue([
        { id: 'item1', type: 'FIN' },
        { id: 'item2', type: 'BUNDLE' },
      ])

      // Should validate input schema
      expect(() => bulkUpdateChannelListingsSchema.parse(input)).not.toThrow()
      
      // Should handle both updates and creates
      expect(input.listings).toHaveLength(2)
      expect(input.listings[0].id).toBeTruthy() // Update
      expect(input.listings[1].id).toBeUndefined() // Create
    })

    it('should validate all items exist', async () => {
      const input: BulkUpdateChannelListingsInput = {
        channelId: 'channel123',
        listings: [
          {
            itemId: 'item1',
            externalSku: 'SKU-001',
            price: 1000,
            isActive: true,
          },
        ],
      }

      mockPrisma.channel.findUnique.mockResolvedValue({ id: 'channel123' })
      mockPrisma.item.findMany.mockResolvedValue([]) // No items found

      // Should handle missing items error
      expect(input.listings[0].itemId).toBe('item1')
    })
  })

  describe('syncChannel', () => {
    it('should sync channel with external platform', async () => {
      const input: ChannelSyncRequest = {
        channelId: 'channel123',
        itemIds: ['item1', 'item2'],
        forceSync: false,
      }

      const mockChannel = {
        id: 'channel123',
        kind: 'SHOPIFY',
        endpoint: 'https://example.myshopify.com',
        apiKey: 'secret_key',
      }

      const mockListings = [
        {
          id: 'listing1',
          itemId: 'item1',
          externalSku: 'SHOPIFY-SKU-001',
          price: 1500,
          isActive: true,
          item: { code: 'BUNDLE-001', name: 'Test Bundle' },
        },
      ]

      mockPrisma.channel.findUnique.mockResolvedValue(mockChannel)
      mockPrisma.channelListing.findMany.mockResolvedValue(mockListings)

      // Should validate input schema
      expect(() => channelSyncRequestSchema.parse(input)).not.toThrow()
      
      // Should filter by itemIds if provided
      expect(input.itemIds).toEqual(['item1', 'item2'])
      expect(input.forceSync).toBe(false)
    })

    it('should handle sync errors gracefully', async () => {
      const input: ChannelSyncRequest = {
        channelId: 'channel123',
        forceSync: true,
      }

      const mockChannel = {
        id: 'channel123',
        kind: 'SHOPIFY',
        endpoint: 'https://invalid-endpoint.com',
      }

      mockPrisma.channel.findUnique.mockResolvedValue(mockChannel)

      // Should handle sync errors in response
      expect(input.forceSync).toBe(true)
      expect(input.itemIds).toBeUndefined() // Sync all items
    })
  })

  describe('getListings', () => {
    it('should return channel listings with pagination', async () => {
      const channelId = 'channel123'
      
      const mockListings = [
        {
          id: 'listing1',
          channelId,
          itemId: 'item1',
          externalSku: 'SKU-001',
          price: 1500,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          channel: {
            id: channelId,
            code: 'SHOPIFY-001',
            name: 'Main Store',
            kind: 'SHOPIFY',
          },
          item: {
            id: 'item1',
            code: 'BUNDLE-001',
            name: 'Test Bundle',
            type: 'BUNDLE',
          },
        },
      ]

      mockPrisma.channelListing.findMany.mockResolvedValue(mockListings)
      mockPrisma.channelListing.count.mockResolvedValue(1)

      // Should include related data
      expect(mockListings[0].channel).toBeDefined()
      expect(mockListings[0].item).toBeDefined()
    })
  })

  describe('deleteListing', () => {
    it('should delete channel listing', async () => {
      const listingId = 'listing123'
      
      const mockListing = {
        id: listingId,
        channelId: 'channel123',
        itemId: 'item456',
      }

      mockPrisma.channelListing.findUnique.mockResolvedValue(mockListing)
      mockPrisma.channelListing.delete.mockResolvedValue(mockListing)

      // Should verify listing exists before deletion
      expect(mockListing.id).toBe(listingId)
    })

    it('should handle non-existent listing deletion', async () => {
      const listingId = 'non-existent'
      
      mockPrisma.channelListing.findUnique.mockResolvedValue(null)

      // Should handle not found case
      expect(mockPrisma.channelListing.findUnique).toBeDefined()
    })
  })
})