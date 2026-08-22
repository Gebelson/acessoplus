export async function GET() {
  return Response.json({ status: 'ok', service: 'acessoplus', timestamp: new Date().toISOString() });
}
