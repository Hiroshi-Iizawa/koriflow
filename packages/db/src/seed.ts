import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const warehouseUser = await prisma.user.upsert({
    where: { email: 'warehouse@koriflow.com' },
    update: {},
    create: {
      email: 'warehouse@koriflow.com',
      password: hashedPassword,
      name: 'Warehouse User',
      role: 'WAREHOUSE',
    },
  })

  const productionUser = await prisma.user.upsert({
    where: { email: 'production@koriflow.com' },
    update: {},
    create: {
      email: 'production@koriflow.com',
      password: hashedPassword,
      name: 'Production User',
      role: 'PRODUCTION',
    },
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@koriflow.com' },
    update: {},
    create: {
      email: 'manager@koriflow.com',
      password: hashedPassword,
      name: 'Manager User',
      role: 'MANAGER',
    },
  })

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@koriflow.com' },
    update: {},
    create: {
      email: 'sales@koriflow.com',
      password: hashedPassword,
      name: 'Sales User',
      role: 'SALES',
    },
  })

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@koriflow.com' },
    update: {},
    create: {
      email: 'admin@koriflow.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  // Create inventory locations
  const freezer = await prisma.inventoryLocation.upsert({
    where: { code: 'FREEZER-01' },
    update: {},
    create: {
      code: 'FREEZER-01',
      name: 'Main Freezer',
    },
  })

  const cooler = await prisma.inventoryLocation.upsert({
    where: { code: 'COOLER-01' },
    update: {},
    create: {
      code: 'COOLER-01',
      name: 'Main Cooler',
    },
  })

  const warehouse = await prisma.inventoryLocation.upsert({
    where: { code: 'WH-01' },
    update: {},
    create: {
      code: 'WH-01',
      name: 'Dry Storage Warehouse',
    },
  })

  // Create raw materials
  const milk = await prisma.item.upsert({
    where: { code: 'RAW-MILK-001' },
    update: {},
    create: {
      code: 'RAW-MILK-001',
      name: '登別産生乳',
      type: 'RAW',
      pack: 'BULK4',
      
      brandName: '登別牧場',
      originCountry: '日本',
      storageMethod: '10℃以下で保存',
      
      energyKcal: 67.0,
      proteinG: 3.3,
      fatG: 3.8,
      carbohydrateG: 4.8,
      sodiumMg: 0.1,
      
      allergenMilk: true,
    },
  })

  const cream = await prisma.item.upsert({
    where: { code: 'RAW-CREAM-001' },
    update: {},
    create: {
      code: 'RAW-CREAM-001',
      name: '生クリーム',
      type: 'RAW',
      pack: 'BULK2',
      
      originCountry: '日本',
      storageMethod: '10℃以下で保存',
      
      energyKcal: 433.0,
      proteinG: 2.0,
      fatG: 45.0,
      carbohydrateG: 3.1,
      sodiumMg: 0.03,
      
      allergenMilk: true,
    },
  })

  const sugar = await prisma.item.upsert({
    where: { code: 'RAW-SUGAR-001' },
    update: {},
    create: {
      code: 'RAW-SUGAR-001',
      name: 'グラニュー糖',
      type: 'RAW',
      
      originCountry: 'オーストラリア',
      storageMethod: '常温保存',
      
      energyKcal: 387.0,
      proteinG: 0.0,
      fatG: 0.0,
      carbohydrateG: 99.2,
      sodiumMg: 0.0,
    },
  })

  const vanilla = await prisma.item.upsert({
    where: { code: 'RAW-VANILLA-001' },
    update: {},
    create: {
      code: 'RAW-VANILLA-001',
      name: 'バニラエッセンス',
      type: 'RAW',
      
      originCountry: 'マダガスカル',
      storageMethod: '常温保存',
      
      energyKcal: 288.0,
      proteinG: 0.1,
      fatG: 0.1,
      carbohydrateG: 12.6,
      sodiumMg: 0.01,
    },
  })

  const cocoa = await prisma.item.upsert({
    where: { code: 'RAW-COCOA-001' },
    update: {},
    create: {
      code: 'RAW-COCOA-001',
      name: 'ココアパウダー',
      type: 'RAW',
      
      originCountry: 'エクアドル',
      storageMethod: '常温保存',
      
      energyKcal: 516.0,
      proteinG: 18.5,
      fatG: 21.6,
      carbohydrateG: 18.5,
      sodiumMg: 0.02,
    },
  })

  const stabilizer = await prisma.item.upsert({
    where: { code: 'RAW-STABILIZER-001' },
    update: {},
    create: {
      code: 'RAW-STABILIZER-001',
      name: '安定剤',
      type: 'RAW',
      pack: 'BULK2',
      
      originCountry: '日本',
      storageMethod: '常温保存',
      
      productFeature: 'アイスクリームの品質安定化のための食品添加物',
    },
  })

  // Create finished products - 企画書に基づくアイスクリーム商品
  const daichiIceCream = await prisma.item.upsert({
    where: { code: 'FIN-ICECREAM-001' },
    update: {},
    create: {
      code: 'FIN-ICECREAM-001',
      name: '大地のアイス 登別ミルク',
      type: 'FIN',
      pack: 'CUP',
      
      // 基本商品情報
      janCode: '4573234250214',
      makerCode: 'DA000001',
      brandName: '大地のアイス',
      makerName: '株式会社ランベル',
      
      // 商品仕様
      contentVolume: '120ml',
      packageSize: '120ml x 12個 x 6箱',
      storageMethod: '-18℃以下で保存してください',
      originCountry: '日本',
      
      // 栄養成分情報 (100g当たり)
      energyKcal: 170.0,
      proteinG: 4.3,
      fatG: 7.8,
      carbohydrateG: 20.8,
      sodiumMg: 0.1,
      
      // アレルゲン情報
      allergenMilk: true,
      allergenEgg: false,
      allergenWheat: false,
      allergenSoybean: false,
      
      // 企業情報
      manufacturerName: '株式会社ランベル',
      manufacturerAddress: '札幌市中央区北3条西会通18丁目35-87',
      manufacturerPhone: '011-299-5614',
      sellerName: '株式会社ランベル',
      sellerAddress: '札幌市中央区北3条西会通18丁目35-87',
      sellerPhone: '011-299-5614',
      
      // その他
      usageNotes: '冷凍ですので取り扱いには十分にご注意ください。人工甘味料を含みます。お客様のご体調次第ですが、摂取量を調整していただくことをお勧めします。',
      productFeature: '全国でも美味しい、数量を中心に食べ続けられて育ったペンギンスペシャルミルクから生まれたアイスクリームです。しっかりと濃いミルクの味わいの中に、ほのかな甘さを感じさせるひとした味覚を引き出しました。',
    },
  })

  const vanillaIceCream = await prisma.item.upsert({
    where: { code: 'FIN-VANILLA-001' },
    update: {},
    create: {
      code: 'FIN-VANILLA-001',
      name: 'プレミアムバニラアイス',
      type: 'FIN',
      pack: 'BULK2',
      
      janCode: '4573234250215',
      brandName: '大地のアイス',
      makerName: '株式会社ランベル',
      contentVolume: '500ml',
      packageSize: '500ml x 6個',
      storageMethod: '-18℃以下で保存してください',
      originCountry: '日本',
      
      energyKcal: 180.0,
      proteinG: 3.8,
      fatG: 9.2,
      carbohydrateG: 22.1,
      sodiumMg: 0.08,
      
      allergenMilk: true,
      allergenEgg: true,
      
      manufacturerName: '株式会社ランベル',
      manufacturerAddress: '札幌市中央区北3条西会通18丁目35-87',
      manufacturerPhone: '011-299-5614',
    },
  })

  const chocolateIceCream = await prisma.item.upsert({
    where: { code: 'FIN-CHOCOLATE-001' },
    update: {},
    create: {
      code: 'FIN-CHOCOLATE-001',
      name: 'リッチチョコレートアイス',
      type: 'FIN',
      pack: 'BULK2',
      
      janCode: '4573234250216',
      brandName: '大地のアイス',
      makerName: '株式会社ランベル',
      contentVolume: '500ml',
      packageSize: '500ml x 6個',
      storageMethod: '-18℃以下で保存してください',
      originCountry: '日本',
      
      energyKcal: 195.0,
      proteinG: 4.1,
      fatG: 10.5,
      carbohydrateG: 24.3,
      sodiumMg: 0.12,
      
      allergenMilk: true,
      allergenEgg: true,
      allergenSoybean: true,
      
      manufacturerName: '株式会社ランベル',
      manufacturerAddress: '札幌市中央区北3条西会通18丁目35-87',
      manufacturerPhone: '011-299-5614',
    },
  })

  // Create recipes
  const daichiRecipe = await prisma.recipe.create({
    data: {
      productId: daichiIceCream.id,
      yieldPct: 95.0,
      version: 1,
      isActive: true,
      items: {
        create: [
          {
            materialId: milk.id,
            qty: 0.65,
            scrapPct: 2.0,
          },
          {
            materialId: cream.id,
            qty: 0.25,
            scrapPct: 1.0,
          },
          {
            materialId: sugar.id,
            qty: 0.08,
            scrapPct: 0.5,
          },
          {
            materialId: stabilizer.id,
            qty: 0.02,
            scrapPct: 0.0,
          },
        ],
      },
    },
  })

  const vanillaRecipe = await prisma.recipe.create({
    data: {
      productId: vanillaIceCream.id,
      yieldPct: 92.0,
      version: 1,
      isActive: true,
      items: {
        create: [
          {
            materialId: milk.id,
            qty: 0.60,
            scrapPct: 2.0,
          },
          {
            materialId: cream.id,
            qty: 0.28,
            scrapPct: 1.0,
          },
          {
            materialId: sugar.id,
            qty: 0.10,
            scrapPct: 0.5,
          },
          {
            materialId: vanilla.id,
            qty: 0.015,
            scrapPct: 0.0,
          },
          {
            materialId: stabilizer.id,
            qty: 0.005,
            scrapPct: 0.0,
          },
        ],
      },
    },
  })

  const chocolateRecipe = await prisma.recipe.create({
    data: {
      productId: chocolateIceCream.id,
      yieldPct: 90.0,
      version: 1,
      isActive: true,
      items: {
        create: [
          {
            materialId: milk.id,
            qty: 0.55,
            scrapPct: 2.0,
          },
          {
            materialId: cream.id,
            qty: 0.30,
            scrapPct: 1.0,
          },
          {
            materialId: sugar.id,
            qty: 0.12,
            scrapPct: 0.5,
          },
          {
            materialId: cocoa.id,
            qty: 0.025,
            scrapPct: 1.0,
          },
          {
            materialId: stabilizer.id,
            qty: 0.005,
            scrapPct: 0.0,
          },
        ],
      },
    },
  })

  // Create some lots with initial inventory
  await prisma.itemLot.createMany({
    data: [
      {
        lotCode: 'MILK-20241201-001',
        itemId: milk.id,
        qty: 1000.0,
        expiryDate: new Date('2024-12-15'),
        prodDate: new Date('2024-12-01'),
        locationId: cooler.id,
        batchNo: 'BATCH-001',
      },
      {
        lotCode: 'CREAM-20241201-001',
        itemId: cream.id,
        qty: 500.0,
        expiryDate: new Date('2024-12-10'),
        prodDate: new Date('2024-12-01'),
        locationId: cooler.id,
        batchNo: 'BATCH-002',
      },
      {
        lotCode: 'SUGAR-20241115-001',
        itemId: sugar.id,
        qty: 200.0,
        prodDate: new Date('2024-11-15'),
        locationId: warehouse.id,
        batchNo: 'BATCH-003',
      },
      {
        lotCode: 'VANILLA-20241110-001',
        itemId: vanilla.id,
        qty: 50.0,
        prodDate: new Date('2024-11-10'),
        locationId: warehouse.id,
        batchNo: 'BATCH-004',
      },
      {
        lotCode: 'COCOA-20241105-001',
        itemId: cocoa.id,
        qty: 100.0,
        prodDate: new Date('2024-11-05'),
        locationId: warehouse.id,
        batchNo: 'BATCH-005',
      },
      {
        lotCode: 'STABILIZER-20241101-001',
        itemId: stabilizer.id,
        qty: 25.0,
        prodDate: new Date('2024-11-01'),
        locationId: warehouse.id,
        batchNo: 'BATCH-006',
      },
    ],
  })

  // Create partners (customers)
  const partner1 = await prisma.partner.upsert({
    where: { code: 'CUST-001' },
    update: {},
    create: {
      code: 'CUST-001',
      name: '北海道スーパーマーケット',
      kind: 'CUSTOMER',
      email: 'purchasing@hokkaido-super.com',
      phone: '011-555-0123',
    },
  })

  // Create addresses for partner1
  await prisma.address.create({
    data: {
      partnerId: partner1.id,
      label: '本社',
      zip: '060-0001',
      prefecture: '北海道',
      city: '札幌市中央区',
      line1: '南1条西1丁目1-1',
      contact: '購買部',
      phone: '011-555-0123',
      isDefault: true,
    },
  })

  await prisma.address.create({
    data: {
      partnerId: partner1.id,
      label: '中央物流センター',
      zip: '060-0010',
      prefecture: '北海道',
      city: '札幌市中央区',
      line1: '北10条西10丁目10-10',
      contact: '物流部',
      phone: '011-555-0124',
      isDefault: false,
    },
  })

  const partner2 = await prisma.partner.upsert({
    where: { code: 'CUST-002' },
    update: {},
    create: {
      code: 'CUST-002',
      name: 'ファミリーマート札幌店',
      kind: 'CUSTOMER',
      email: 'orders@family.co.jp',
      phone: '011-555-0456',
    },
  })

  // Create address for partner2
  const partner2Address = await prisma.address.create({
    data: {
      partnerId: partner2.id,
      label: '店舗',
      zip: '001-0010',
      prefecture: '北海道',
      city: '札幌市北区',
      line1: '北10条西5丁目3-15',
      phone: '011-555-0456',
      isDefault: true,
    },
  })

  // Create vendor partner
  const vendor1 = await prisma.partner.upsert({
    where: { code: 'VEND-001' },
    update: {},
    create: {
      code: 'VEND-001',
      name: '北海道酪農協同組合',
      kind: 'VENDOR',
      email: 'sales@hokkaido-dairy.com',
      phone: '011-666-0789',
    },
  })

  await prisma.address.create({
    data: {
      partnerId: vendor1.id,
      label: '本社',
      zip: '060-0042',
      prefecture: '北海道',
      city: '札幌市中央区',
      line1: '大通西4丁目',
      contact: '営業部',
      phone: '011-666-0789',
      isDefault: true,
    },
  })

  // Get default addresses for sales orders
  const partner1DefaultAddress = await prisma.address.findFirst({
    where: { partnerId: partner1.id, isDefault: true },
  })

  // Create sample sales orders
  const salesOrder1 = await prisma.salesOrder.create({
    data: {
      soNo: 'SO-2024-001',
      partnerId: partner1.id,
      shipToId: partner1DefaultAddress?.id,
      status: 'DRAFT',
      orderedAt: new Date(),
      lines: {
        create: [
          {
            itemId: daichiIceCream.id,
            qty: 100,
            uom: 'EA',
          },
          {
            itemId: vanillaIceCream.id,
            qty: 50,
            uom: 'EA',
          },
        ],
      },
    },
  })

  const salesOrder2 = await prisma.salesOrder.create({
    data: {
      soNo: 'SO-2024-002',
      partnerId: partner2.id,
      shipToId: partner2Address.id,
      status: 'CONFIRMED',
      orderedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      lines: {
        create: [
          {
            itemId: chocolateIceCream.id,
            qty: 30,
            uom: 'EA',
          },
        ],
      },
    },
  })

  console.log('Database seeded successfully!')
  console.log('Created:')
  console.log('- 5 Users (warehouse, production, manager, sales, admin)')
  console.log('- 3 Inventory Locations')
  console.log('- 6 Raw Materials with detailed specifications')
  console.log('- 3 Finished Products (including 大地のアイス 登別ミルク)')
  console.log('- 3 Recipes with material consumption ratios')
  console.log('- 6 Initial Inventory Lots')
  console.log('- 3 Partners (2 customers, 1 vendor)')
  console.log('- 5 Addresses with default settings')
  console.log('- 2 Sales Orders with lines and ship-to addresses')
  console.log('')
  console.log('企画書対応データ:')
  console.log('- JANコード: 4573234250214')
  console.log('- 商品名: 大地のアイス 登別ミルク')
  console.log('- 栄養成分: エネルギー170kcal, たんぱく質4.3g, 脂質7.8g')
  console.log('- アレルゲン: 乳成分')
  console.log('- 製造者: 株式会社ランベル')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })