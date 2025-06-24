import { prisma } from "@koriflow/db"
import { notFound } from "next/navigation"
import { PartnerDetail } from "@components/partners/partner-detail"

interface PartnerPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PartnerPage({ params }: PartnerPageProps) {
  const { id } = await params
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: {
      addresses: {
        orderBy: [
          { isDefault: 'desc' },
          { label: 'asc' },
        ],
      },
      salesOrders: {
        orderBy: { orderedAt: 'desc' },
        take: 10,
        include: {
          _count: {
            select: {
              lines: true,
            },
          },
        },
      },
      purchaseOrders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!partner) {
    notFound()
  }

  // Serialize Decimal values for sales orders
  const serializedPartner = {
    ...partner,
    salesOrders: partner.salesOrders.map(order => ({
      ...order,
      // Add any decimal serialization if needed
    })),
  }

  return <PartnerDetail partner={serializedPartner} />
}