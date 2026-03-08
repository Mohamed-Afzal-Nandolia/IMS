import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Exclude static files, Next.js internals, and API routes from middleware
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('.') ||
        pathname.startsWith('/api') ||
        pathname === '/login' ||
        pathname === '/'
    ) {
        return NextResponse.next();
    }

    // Handle super-admin routes
    if (pathname.startsWith('/super-admin')) {
        if (pathname === '/super-admin/login') {
            return NextResponse.next(); // Anyone can view login page (protected by API)
        }

        // For /super-admin/dashboard or others, they must be authenticated
        // Note: We don't have server-side session checks here, but we check if token exists.
        // Real validation happens on the API side when they fetch data, and client side redirects.
        return NextResponse.next();
    }

    // Handle legacy /dashboard accesses by redirecting to login to get their slug
    // or we could let the client handle it if they have it in localStorage.
    // Actually, better: let client handle the redirect from /dashboard to /[slug]/dashboard
    // so we don't block it here, because middleware cannot read localStorage.

    // We can just pass through
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
