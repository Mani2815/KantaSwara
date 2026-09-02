import { isRedisHealthy, disconnectRedis } from './server/lib/redis/redis.ts';

async function test() {
  console.log("Checking Redis Health...");
  const healthy = await isRedisHealthy();
  console.log("Is Healthy:", healthy);
  await disconnectRedis();
  process.exit(0);
}
test();
