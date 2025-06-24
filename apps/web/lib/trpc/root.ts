import { router } from './server'
import { recipeRouter } from './routers/recipe'
import { itemRouter } from './routers/item'
import { customerRouter } from './routers/customer'
import { salesOrderRouter } from './routers/sales-order'
import { partnerRouter } from './routers/partner'
import { addressRouter } from './routers/address'
import { bundleRouter } from './routers/bundle'
import { channelRouter } from './routers/channel'

export const appRouter = router({
  recipe: recipeRouter,
  item: itemRouter,
  customer: customerRouter,
  salesOrder: salesOrderRouter,
  partner: partnerRouter,
  address: addressRouter,
  bundle: bundleRouter,
  channel: channelRouter,
})

export type AppRouter = typeof appRouter