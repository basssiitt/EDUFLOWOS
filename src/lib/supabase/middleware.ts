import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public paths that don't require authentication
  const publicPaths = [
    '/login',
    '/register',
    '/onboarding',
    '/api/auth',
    '/api/webhooks',
    '/_next',
    '/favicon.ico',
    '/assets',
  ];

  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If user is not signed in and trying to access protected route
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Tenant routing: extract school slug from path
  const pathSegments = request.nextUrl.pathname.split('/');
  if (pathSegments[1] === 'portal' && pathSegments[2]) {
    // Store school slug in headers for downstream use
    supabaseResponse.headers.set('x-school-slug', pathSegments[2]);
  }

  return supabaseResponse;
}
