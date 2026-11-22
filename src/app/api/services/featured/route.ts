import { NextResponse } from 'next/server';
import { store } from '@/lib/server-store';

export async function GET() {
  const featured = store.services
    .filter((s) => s.status === 'approved' && s.isActive)
    .slice(0, 6);

  return NextResponse.json({
    success: true,
    services: featured,
  });
}
