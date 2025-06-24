import { prisma } from "@koriflow/db"
import { DataTable, Button } from "@koriflow/ui"
import { columns } from "./columns"
import Link from "next/link"

export default async function MovesPage() {
  const moves = await prisma.inventoryMove.findMany({
    include: {
      lot: {
        include: {
          item: true,
        }
      }
    },
    orderBy: {
      at: 'desc'
    }
  })

  // Serialize Decimal values to strings for client components
  const serializedMoves = moves.map(move => ({
    ...move,
    deltaQty: move.deltaQty.toString(),
    lot: {
      ...move.lot,
      qty: move.lot.qty.toString(),
      item: {
        ...move.lot.item,
        energyKcal: move.lot.item.energyKcal?.toString() || null,
        proteinG: move.lot.item.proteinG?.toString() || null,
        fatG: move.lot.item.fatG?.toString() || null,
        carbohydrateG: move.lot.item.carbohydrateG?.toString() || null,
        sodiumMg: move.lot.item.sodiumMg?.toString() || null,
      }
    }
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">在庫移動</h1>
          <p className="text-muted-foreground">
            全ての在庫移動と取引を追跡
          </p>
        </div>
        <Button asChild>
          <Link href="/moves/new">
            移動記録
          </Link>
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={serializedMoves}
        searchKey="lot.lotCode"
        searchPlaceholder="ロットコードで検索..."
      />
    </div>
  )
}