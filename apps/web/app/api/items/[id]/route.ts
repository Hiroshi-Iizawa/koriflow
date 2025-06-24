import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@koriflow/db"
import { z } from "zod"

const updateItemSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["FIN", "RAW", "WIPNG"]),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateItemSchema.parse(body)

    const item = await prisma.item.update({
      where: {
        id: params.id,
      },
      data: validatedData,
    })

    return NextResponse.json(item)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.item.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}