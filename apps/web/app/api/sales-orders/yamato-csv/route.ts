import { NextRequest, NextResponse } from 'next/server'
import { PDFGenerator } from '@lib/services/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const { orderIds } = await request.json()
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: '受注IDが指定されていません' },
        { status: 400 }
      )
    }
    
    const pdfGenerator = new PDFGenerator()
    const csv = await pdfGenerator.generateYamatoB2CSV(orderIds)
    
    // Return CSV response
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="yamato-b2-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}