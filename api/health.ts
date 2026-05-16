export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  return new Response(JSON.stringify({ 
    status: "edge-isolated-debug", 
    hasUrl: !!process.env.DATABASE_URL,
    hasToken: !!process.env.DATABASE_AUTH_TOKEN,
    vercel: !!process.env.VERCEL,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
