import { Worker, Queue, QueueScheduler } from 'bullmq'
import Redis from 'ioredis'
import { prisma } from '@koriflow/db'

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

// Create queue and scheduler
const costRollupQueue = new Queue('cost-rollup', { connection })
const scheduler = new QueueScheduler('cost-rollup', { connection })

// Worker to process cost rollup jobs
const costRollupWorker = new Worker(
  'cost-rollup',
  async (job) => {
    console.log(`Processing cost rollup job: ${job.id}`)
    
    try {
      // Placeholder for nightly cost rollup logic
      const totalItems = await prisma.item.count()
      const totalLots = await prisma.itemLot.count()
      const totalMoves = await prisma.inventoryMove.count()
      
      console.log('Daily Cost Rollup Summary:')
      console.log(`- Total Items: ${totalItems}`)
      console.log(`- Total Lots: ${totalLots}`)
      console.log(`- Total Moves: ${totalMoves}`)
      
      // Here you would normally calculate:
      // - Inventory valuations
      // - Daily/monthly cost summaries
      // - Production cost analysis
      // - Raw material consumption rates
      // - Finished goods production costs
      
      return {
        status: 'completed',
        summary: {
          totalItems,
          totalLots,
          totalMoves,
          processedAt: new Date().toISOString(),
        }
      }
    } catch (error) {
      console.error('Cost rollup job failed:', error)
      throw error
    }
  },
  { connection }
)

// Add repeatable job for nightly cost rollup (runs at 2 AM daily)
await costRollupQueue.add(
  'nightly-cost-rollup',
  {},
  {
    repeat: {
      pattern: '0 2 * * *', // 2 AM every day
    },
    removeOnComplete: 10,
    removeOnFail: 5,
  }
)

console.log('🚀 KoriFlow Worker started successfully')
console.log('📅 Nightly cost rollup scheduled for 2:00 AM daily')

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...')
  await costRollupWorker.close()
  await scheduler.close()
  await costRollupQueue.close()
  await connection.quit()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('Shutting down worker...')
  await costRollupWorker.close()
  await scheduler.close()
  await costRollupQueue.close()
  await connection.quit()
  process.exit(0)
})