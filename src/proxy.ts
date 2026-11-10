import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getIndexNowKey, getIndexNowKeyPath } from '@/lib/indexNow';
import { getProductionSiteUrl, shouldRedirectToCanonicalHost } from '@/lib/siteUrl';

export async function proxy(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  if (shouldRedirectToCanonicalHost(host)) {
    const redirectUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, getProductionSiteUrl());
    return NextResponse.redirect(redirectUrl, 308);
  }

  const indexNowKey = getIndexNowKey();
  const indexNowKeyPath = getIndexNowKeyPath();
  if (indexNowKey && request.nextUrl.pathname === indexNowKeyPath) {
    return new NextResponse(`${indexNowKey}\n`, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/profile') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Anonymous canonical pages can be served directly by the CDN. Keep session
    // refresh for requests with cookies and canonicalization on deployment aliases.
    {
      source: '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|api).*)',
      has: [{ type: 'header', key: 'cookie' }],
    },
    {
      source: '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|api).*)',
      has: [{ type: 'host', value: '(?:.+\\.vercel\\.app|yoplayables\\.com)' }],
    },
    '/:key([A-Za-z0-9-]+).txt',
    '/admin/:path*',
    '/profile/:path*',
  ],
};
