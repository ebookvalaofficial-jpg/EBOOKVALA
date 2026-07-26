import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as { role?: string; isBanned?: boolean; isAuthor?: boolean } | undefined;

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/library') ||
    pathname.startsWith('/author') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/reader');

  const isAuthorRoute = pathname.startsWith('/author');

  const isAdminRoute = pathname.startsWith('/admin');

  // 0. Banned account check
  if (isLoggedIn && user?.isBanned && !isAuthRoute) {
    return Response.redirect(new URL('/login?error=account_banned', req.nextUrl));
  }

  // 1. Admin route access control gate
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname + req.nextUrl.search);
      return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl));
    }
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return Response.redirect(new URL('/?unauthorized=true', req.nextUrl));
    }
  }

  // 1.5 Author route access control gate
  if (isAuthorRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname + req.nextUrl.search);
      return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl));
    }
    if (!user?.isAuthor) {
      return Response.redirect(new URL('/become-an-author', req.nextUrl));
    }
  }

  // 2. Redirect logged-in users away from auth routes to home
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL('/', req.nextUrl));
  }

  // 3. Redirect unauthenticated users away from protected routes to /login with callbackUrl
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname + req.nextUrl.search);
    return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png|robots.txt|sitemap.xml).*)'],
};
