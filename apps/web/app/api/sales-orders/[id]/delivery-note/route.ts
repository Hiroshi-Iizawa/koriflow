import { NextRequest, NextResponse } from 'next/server'
import { PDFGenerator } from '@lib/services/pdf-generator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pdfGenerator = new PDFGenerator()
    const pdf = await pdfGenerator.generateDeliveryNote(id)
    
    // Get PDF as buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    
    // Return PDF response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="delivery-note-${id}.pdf"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}