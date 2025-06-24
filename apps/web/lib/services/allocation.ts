import { PrismaClient, AllocationStatus } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

export class AllocationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Allocate inventory lots for a sales order using FIFO (First In, First Out) strategy
   */
  async allocateSalesOrder(salesOrderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const salesOrder = await tx.salesOrder.findUnique({
        where: { id: salesOrderId },
        include: {
          lines: {
            include: {
              item: true,
              allocations: true,
            },
          },
        },
      })

      if (!salesOrder) {
        throw new Error('Sales order not found')
      }

      if (salesOrder.status !== 'DRAFT') {
        throw new Error('Can only allocate draft orders')
      }

      const allocationResults: Array<{
        lineId: string
        itemCode: string
        requested: number
        allocated: number
        allocations: Array<{
          lotCode: string
          qty: number
        }>
      }> = []

      // Process each line
      for (const line of salesOrder.lines) {
        const result = await this.allocateLine(tx, line.id, line.itemId, new Decimal(line.qty))
        allocationResults.push({
          lineId: line.id,
          itemCode: line.item.code,
          requested: line.qty.toNumber(),
          allocated: result.allocatedQty.toNumber(),
          allocations: result.allocations,
        })
      }

      // Update order status to CONFIRMED if all lines are fully allocated
      const fullyAllocated = allocationResults.every(r => r.allocated >= r.requested)
      
      if (fullyAllocated) {
        await tx.salesOrder.update({
          where: { id: salesOrderId },
          data: { status: 'CONFIRMED' },
        })

        // Create provisional inventory moves
        for (const result of allocationResults) {
          for (const allocation of result.allocations) {
            const lot = await tx.itemLot.findFirst({
              where: { lotCode: allocation.lotCode },
            })

            if (lot) {
              await tx.inventoryMove.create({
                data: {
                  lotId: lot.id,
                  deltaQty: new Decimal(allocation.qty).neg(),
                  reason: 'ISSUE',
                  ref: `SO-${salesOrder.soNo}`,
                },
              })
            }
          }
        }
      }

      return {
        salesOrderId,
        status: fullyAllocated ? 'CONFIRMED' : 'PARTIAL',
        results: allocationResults,
      }
    })
  }

  /**
   * Allocate inventory for a specific sales line
   */
  private async allocateLine(
    tx: any, 
    lineId: string, 
    itemId: string, 
    requestedQty: Decimal
  ) {
    // Find available lots using FIFO (oldest first)
    const availableLots = await tx.itemLot.findMany({
      where: {
        itemId,
        qty: { gt: 0 },
      },
      include: {
        allocations: {
          where: { status: 'PROVISIONAL' },
        },
      },
      orderBy: [
        { prodDate: 'asc' },  // FIFO by production date
        { createdAt: 'asc' }, // Then by creation date
      ],
    })

    let remainingQty = requestedQty
    const allocations: Array<{ lotCode: string; qty: number }> = []

    for (const lot of availableLots) {
      if (remainingQty.lte(0)) break

      // Calculate available quantity (total - already allocated)
      const allocatedQty = lot.allocations.reduce(
        (sum, alloc) => sum.add(alloc.qty), 
        new Decimal(0)
      )
      const availableQty = lot.qty.sub(allocatedQty)

      if (availableQty.lte(0)) continue

      // Determine allocation quantity
      const allocationQty = remainingQty.lte(availableQty) ? remainingQty : availableQty

      // Create allocation record
      await tx.allocation.create({
        data: {
          soLineId: lineId,
          lotId: lot.id,
          qty: allocationQty,
          status: AllocationStatus.PROVISIONAL,
        },
      })

      allocations.push({
        lotCode: lot.lotCode,
        qty: allocationQty.toNumber(),
      })

      remainingQty = remainingQty.sub(allocationQty)
    }

    return {
      allocatedQty: requestedQty.sub(remainingQty),
      allocations,
    }
  }

  /**
   * Commit allocations (convert from PROVISIONAL to COMMITTED)
   */
  async commitAllocations(salesOrderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const allocations = await tx.allocation.findMany({
        where: {
          soLine: {
            soId: salesOrderId,
          },
          status: AllocationStatus.PROVISIONAL,
        },
        include: {
          lot: true,
          soLine: {
            include: {
              so: true,
            },
          },
        },
      })

      // Update allocation status
      for (const allocation of allocations) {
        await tx.allocation.update({
          where: { id: allocation.id },
          data: { status: AllocationStatus.COMMITTED },
        })

        // Update lot quantity
        await tx.itemLot.update({
          where: { id: allocation.lotId },
          data: {
            qty: { decrement: allocation.qty },
          },
        })
      }

      // Update sales order status
      await tx.salesOrder.update({
        where: { id: salesOrderId },
        data: { status: 'PICKED' },
      })

      return allocations.length
    })
  }

  /**
   * Release allocations (for cancelled orders)
   */
  async releaseAllocations(salesOrderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const deletedCount = await tx.allocation.deleteMany({
        where: {
          soLine: {
            soId: salesOrderId,
          },
          status: AllocationStatus.PROVISIONAL,
        },
      })

      return deletedCount.count
    })
  }
}