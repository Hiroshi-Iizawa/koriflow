import { prisma } from "@koriflow/db"
import { EditItemClient } from "./edit-item-client"
import { notFound } from "next/navigation"

interface EditItemPageProps {
  params: {
    id: string
  }
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const item = await prisma.item.findUnique({
    where: {
      id: params.id
    }
  })

  if (!item) {
    notFound()
  }

  // Convert database item to form data format matching our new schema
  const formData = {
    // Basic fields
    code: item.code,
    name: item.name,
    type: item.type,
    pack: item.pack || "CUP",
    
    // Product info
    janCode: item.janCode || undefined,
    makerCode: item.makerCode || undefined,
    brandName: item.brandName || undefined,
    
    // Specifications 
    contentVolume: item.contentVolume || undefined,
    packageSize: item.packageSize || undefined,
    storageMethod: item.storageMethod || undefined,
    countryOfOrigin: item.originCountry || undefined,
    
    // Nutritional info (convert Decimal to number)
    energy: item.energyKcal ? Number(item.energyKcal) : undefined,
    protein: item.proteinG ? Number(item.proteinG) : undefined,
    fat: item.fatG ? Number(item.fatG) : undefined,
    carbs: item.carbohydrateG ? Number(item.carbohydrateG) : undefined,
    sodium: item.sodiumMg ? Number(item.sodiumMg) : undefined,
    
    // Allergens (28 fields)
    allergenShrimp: item.allergenShrimp,
    allergenCrab: item.allergenCrab,
    allergenWheat: item.allergenWheat,
    allergenBuckwheat: item.allergenBuckwheat,
    allergenEgg: item.allergenEgg,
    allergenMilk: item.allergenMilk,
    allergenPeanut: item.allergenPeanut,
    allergenWalnut: item.allergenWalnut,
    allergenAbalone: item.allergenAbalone,
    allergenSquid: item.allergenSquid,
    allergenSalmonRoe: item.allergenSalmonRoe,
    allergenOrange: item.allergenOrange,
    allergenCashew: item.allergenCashew,
    allergenKiwi: item.allergenKiwi,
    allergenBeef: item.allergenBeef,
    allergenSesame: item.allergenSesame,
    allergenSalmon: item.allergenSalmon,
    allergenMackerel: item.allergenMackerel,
    allergenSoybean: item.allergenSoybean,
    allergenChicken: item.allergenChicken,
    allergenBanana: item.allergenBanana,
    allergenPork: item.allergenPork,
    allergenMatsutake: item.allergenMatsutake,
    allergenPeach: item.allergenPeach,
    allergenYam: item.allergenYam,
    allergenApple: item.allergenApple,
    allergenGelatin: item.allergenGelatin,
    allergenSeafood: item.allergenSeafood,
    allergenAlmond: item.allergenAlmond,
    
    // Company info
    makerName: item.makerName || undefined,
    makerAddress: item.manufacturerAddress || undefined,
    makerPhone: item.manufacturerPhone || undefined,
    sellerName: item.sellerName || undefined,
    sellerAddress: item.sellerAddress || undefined,
    sellerPhone: item.sellerPhone || undefined,
    
    // Other
    usageNote: item.usageNotes || undefined,
  }

  return (
    <EditItemClient 
      itemId={params.id}
      initialData={formData}
    />
  )
}