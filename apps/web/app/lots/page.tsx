import { prisma } from "@koriflow/db"
import { LotsTabbed } from "@components/lots/lots-tabbed"

export default async function LotsPage() {
  const lots = await prisma.itemLot.findMany({
    include: {
      item: true,
      location: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Serialize Decimal values to strings for client components
  const serializedLots = lots.map(lot => ({
    ...lot,
    qty: lot.qty.toString(),
    item: {
      ...lot.item,
      energyKcal: lot.item.energyKcal?.toString() || null,
      proteinG: lot.item.proteinG?.toString() || null,
      fatG: lot.item.fatG?.toString() || null,
      carbohydrateG: lot.item.carbohydrateG?.toString() || null,
      sodiumMg: lot.item.sodiumMg?.toString() || null,
    }
  }))

  return <LotsTabbed lots={serializedLots} />
}