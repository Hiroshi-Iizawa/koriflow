import jsPDF from 'jspdf'
import { prisma } from '@koriflow/db'

export class PDFGenerator {
  async generateDeliveryNote(salesOrderId: string) {
    // Get sales order with all relations
    const order = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: {
        partner: true,
        shipTo: true,
        lines: {
          include: {
            item: true,
            allocations: {
              include: {
                lot: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new Error('受注が見つかりません')
    }

    if (order.status !== 'PICKED' && order.status !== 'SHIPPED') {
      throw new Error('納品書はピッキング済みまたは出荷済みの受注のみ生成できます')
    }

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Add custom font support for Japanese
    doc.setFont('helvetica')
    
    // Title
    doc.setFontSize(20)
    doc.text('納品書', 105, 20, { align: 'center' })
    
    // Order info
    doc.setFontSize(10)
    doc.text(`受注番号: ${order.soNo}`, 20, 40)
    doc.text(`日付: ${new Date(order.orderedAt).toLocaleDateString('ja-JP')}`, 150, 40)
    
    // Partner info
    doc.setFontSize(12)
    doc.text(`${order.partner.name} 御中`, 20, 55)
    doc.setFontSize(10)
    
    // Shipping address
    if (order.shipTo) {
      doc.text('配送先:', 20, 65)
      doc.text(order.shipTo.label, 20, 70)
      doc.text(`〒${order.shipTo.postalCode}`, 20, 75)
      doc.text(`${order.shipTo.prefecture}${order.shipTo.city}${order.shipTo.address1}`, 20, 80)
      if (order.shipTo.address2) {
        doc.text(order.shipTo.address2, 20, 85)
      }
      if (order.shipTo.phone) {
        doc.text(`TEL: ${order.shipTo.phone}`, 20, 90)
      }
    }
    
    // Company info (sender)
    doc.text('発送元:', 120, 65)
    doc.text('KoriFlow アイスクリーム', 120, 70)
    doc.text('〒100-0001', 120, 75)
    doc.text('東京都千代田区千代田1-1', 120, 80)
    doc.text('TEL: 03-1234-5678', 120, 85)
    
    // Items table
    let yPosition = 110
    
    // Table header
    doc.setFillColor(240, 240, 240)
    doc.rect(20, yPosition - 5, 170, 8, 'F')
    doc.text('商品コード', 25, yPosition)
    doc.text('商品名', 50, yPosition)
    doc.text('数量', 130, yPosition)
    doc.text('単位', 150, yPosition)
    doc.text('ロット', 165, yPosition)
    
    yPosition += 10
    
    // Table content
    for (const line of order.lines) {
      doc.text(line.item.code, 25, yPosition)
      doc.text(line.item.name, 50, yPosition)
      doc.text(line.qty.toString(), 130, yPosition)
      doc.text(line.uom, 150, yPosition)
      
      // Show allocated lots
      const lots = line.allocations
        .map(alloc => `${alloc.lot.lotCode}(${alloc.qty})`)
        .join(', ')
      doc.setFontSize(8)
      doc.text(lots || '-', 165, yPosition)
      doc.setFontSize(10)
      
      yPosition += 8
      
      // Add new page if needed
      if (yPosition > 260) {
        doc.addPage()
        yPosition = 20
      }
    }
    
    // Footer
    doc.setFontSize(8)
    doc.text('※この納品書は電子的に生成されたものです。', 20, 280)
    doc.text(`生成日時: ${new Date().toLocaleString('ja-JP')}`, 120, 280)
    
    return doc
  }

  async generateYamatoB2CSV(salesOrderIds: string[]) {
    const orders = await prisma.salesOrder.findMany({
      where: { 
        id: { in: salesOrderIds },
        status: 'SHIPPED'
      },
      include: {
        partner: true,
        shipTo: true,
        lines: {
          include: {
            item: true,
          },
        },
      },
    })

    if (orders.length === 0) {
      throw new Error('出荷済みの受注が見つかりません')
    }

    // CSV headers based on Yamato B2 format
    const headers = [
      'お客様管理番号',
      'お届け先氏名',
      'お届け先敬称',
      'お届け先郵便番号',
      'お届け先住所',
      'お届け先建物名',
      'お届け先電話番号',
      '荷物個数',
      '記事',
      '発送予定日',
    ]

    const rows = [headers]

    for (const order of orders) {
      const address = order.shipTo || {
        postalCode: '',
        prefecture: '',
        city: '',
        address1: '',
        address2: '',
        phone: '',
      }

      const row = [
        order.soNo, // お客様管理番号
        order.partner.name, // お届け先氏名
        '様', // お届け先敬称
        address.postalCode, // お届け先郵便番号
        `${address.prefecture}${address.city}${address.address1}`, // お届け先住所
        address.address2 || '', // お届け先建物名
        address.phone || order.partner.phone || '', // お届け先電話番号
        '1', // 荷物個数
        order.lines.map(l => `${l.item.name}×${l.qty}`).join('、'), // 記事
        new Date().toLocaleDateString('ja-JP').replace(/\//g, '-'), // 発送予定日
      ]

      rows.push(row)
    }

    // Convert to CSV format
    const csv = rows
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    // Add BOM for Excel compatibility
    const bom = '\uFEFF'
    return bom + csv
  }
}