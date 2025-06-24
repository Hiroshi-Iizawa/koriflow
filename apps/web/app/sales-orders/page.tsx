import { prisma } from "@koriflow/db"
import { SalesOrdersKanban } from "@components/sales-orders/sales-orders-kanban"

export default async function SalesOrdersPage() {
  const salesOrders = await prisma.salesOrder.findMany({
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

  // Serialize Decimal values for client components
  const serializedOrders = salesOrders.map(order => ({
    ...order,
    lines: order.lines.map(line => ({
      ...line,
      qty: line.qty.toString(),
      allocations: line.allocations.map(allocation => ({
        ...allocation,
        qty: allocation.qty.toString(),
        lot: {
          ...allocation.lot,
          qty: allocation.lot.qty.toString(),
        },
      })),
    })),
  }))

  return <SalesOrdersKanban orders={serializedOrders} />
}