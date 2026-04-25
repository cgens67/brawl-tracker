import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');
  const endpoint = searchParams.get('endpoint') || 'profile'; 
  
  if (!tag) return NextResponse.json({ error: 'Player tag is required' }, { status: 400 });

  const cleanTag = tag.replace('#', '').toUpperCase();
  const API_KEY = process.env.BRAWL_STARS_API_KEY;

  if (!API_KEY) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  // RoyaleAPI Proxy is required for Vercel deployment
  const baseUrl = `https://bsproxy.royaleapi.dev/v1/players/%23${cleanTag}`;
  const url = endpoint === 'battlelog' ? `${baseUrl}/battlelog` : baseUrl;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: 'application/json' },
      next: { revalidate: 30 } 
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: 'Failed to fetch API', details: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
  }
}
