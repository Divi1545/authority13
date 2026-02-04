import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
  redisSub: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
  })

export const redisSub =
  globalForRedis.redisSub ??
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
  globalForRedis.redisSub = redisSub
}

// Pub/Sub helpers
export async function publishEvent(channel: string, event: any) {
  await redis.publish(channel, JSON.stringify(event))
}

export function subscribeToEvents(channel: string, callback: (event: any) => void) {
  redisSub.subscribe(channel)
  redisSub.on('message', (ch, message) => {
    if (ch === channel) {
      try {
        const event = JSON.parse(message)
        callback(event)
      } catch (error) {
        console.error('Failed to parse event:', error)
      }
    }
  })
}
