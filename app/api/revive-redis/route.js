import redis from '@/lib/redis';

export async function POST() {
  try {
    const pong = await redis.ping();
    return new Response(`Redis is alive: ${pong}`, { status: 200 });
  } catch (err) {
    console.error("Redis ping failed:", err);
    return new Response("Redis revival failed", { status: 500 });
  }
}
