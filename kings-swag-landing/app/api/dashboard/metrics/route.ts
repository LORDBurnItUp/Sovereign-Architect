import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try main API first, fallback to test endpoint
    const primaryUrl = 'http://localhost:5050/api/dashboard/metrics';
    const fallbackUrl = 'http://localhost:5051/api/dashboard/metrics';

    let response = await fetch(primaryUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    }).catch(() => null);

    // If primary fails, try fallback
    if (!response || !response.ok) {
      response = await fetch(fallbackUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
    }

    if (!response.ok) {
      throw new Error(`Python API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Dashboard metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics from both endpoints' },
      { status: 500 }
    );
  }
}
