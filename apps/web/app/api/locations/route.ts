import { NextResponse } from "next/server"
import { prisma } from "@koriflow/db"

export async function GET() {
  try {
    const locations = await prisma.inventoryLocation.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(locations)
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}