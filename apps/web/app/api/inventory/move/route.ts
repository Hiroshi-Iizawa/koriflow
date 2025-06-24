import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@koriflow/db"
import { z } from "zod"

const inventoryMoveSchema = z.object({
  lotId: z.string().min(1),
  deltaQty: z.number(),
  reason: z.enum(["RECEIVE", "ISSUE", "ADJUST", "CONSUME", "PRODUCE"]),
  ref: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = inventoryMoveSchema.parse(body)

    const result = await prisma.$transaction(async (tx) => {
      // Create the inventory move
      const move = await tx.inventoryMove.create({
        data: validatedData,
      })

      // Update the lot quantity
      const lot = await tx.itemLot.findUniqueOrThrow({
        where: { id: validatedData.lotId }
      })

      const newQty = lot.qty.toNumber() + validatedData.deltaQty

      if (newQty < 0) {
        throw new Error("Insufficient inventory quantity")
      }

      await tx.itemLot.update({
        where: { id: validatedData.lotId },
        data: { qty: newQty }
      })

      return move
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating inventory move:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}