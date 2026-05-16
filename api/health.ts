export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ 
    status: "isolated-debug", 
    hasUrl: !!process.env.DATABASE_URL,
    hasToken: !!process.env.DATABASE_AUTH_TOKEN,
    vercel: !!process.env.VERCEL,
    timestamp: new Date().toISOString()
  }, null, 2));
}
