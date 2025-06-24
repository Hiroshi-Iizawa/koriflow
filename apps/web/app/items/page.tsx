import { prisma } from "@koriflow/db"
import { ItemsClient } from "@components/items/items-client"

export default async function ItemsPage() {
  const items = await prisma.item.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Serialize Decimal values to strings for client components
  const serializedItems = items.map(item => ({
    ...item,
    energyKcal: item.energyKcal?.toString() || null,
    proteinG: item.proteinG?.toString() || null,
    fatG: item.fatG?.toString() || null,
    carbohydrateG: item.carbohydrateG?.toString() || null,
    sodiumMg: item.sodiumMg?.toString() || null,
  }))

  return <ItemsClient items={serializedItems} />
}