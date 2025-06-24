import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@koriflow/db"
import { z } from "zod"

const createLotSchema = z.object({
  lotCode: z.string().min(1),
  itemId: z.string().min(1),
  qty: z.number().min(0),
  expiryDate: z.date().optional().nullable(),
  prodDate: z.date().optional().nullable(),
  batchNo: z.string().optional(),
  locationId: z.string().optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createLotSchema.parse(body)

    const lot = await prisma.itemLot.create({
      data: validatedData,
    })

    return NextResponse.json(lot)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating lot:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const lots = await prisma.itemLot.findMany({
      include: {
        item: true,
        location: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(lots)
  } catch (error) {
    console.error("Error fetching lots:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}