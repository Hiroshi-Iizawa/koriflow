import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@koriflow/db"
import { z } from "zod"

const createItemSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["FIN", "RAW", "WIPNG"]),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createItemSchema.parse(body)

    const item = await prisma.item.create({
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

    console.error("Error creating item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}