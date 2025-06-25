import redis from '@/lib/redis';

export async function POST(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (token !== process.env.APP_API_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const pong = await redis.ping();
    return new Response(`Redis is alive: ${pong}`, { status: 200 });
  } catch (err) {
    console.error("Redis ping failed:", err);
    return new Response("Redis revival failed", { status: 500 });
  }
}
