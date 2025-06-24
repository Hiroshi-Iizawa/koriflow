import { prisma } from "@koriflow/db"
import { PartnersClient } from "@components/partners/partners-client"

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    include: {
      addresses: {
        where: { isDefault: true },
        take: 1,
      },
      _count: {
        select: {
          addresses: true,
          salesOrders: true,
          purchaseOrders: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return <PartnersClient partners={partners} />
}