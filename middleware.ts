import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Route mapping based on user type
const DASHBOARD_ROUTES = {
  patient: "/patient",
  pharmacy: "/pharmacy",
  charity: "/charity",
  admin: "/admin",
} as const;

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/campaigns",
  "/view-health-profile",
];

// Auth routes that authenticated users shouldn't access
const AUTH_ROUTES = ["/login", "/signup"];

// Helper function to check if a route is public
function isPublicRoute(pathname: string): boolean {
  // Check exact matches
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Check if it's a campaign detail page (e.g., /campaigns/123)
  if (pathname.startsWith("/campaigns/")) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const userType = token?.userType as keyof typeof DASHBOARD_ROUTES | undefined;

  // If user is authenticated and tries to access auth pages, redirect to their dashboard
  if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
    if (userType && DASHBOARD_ROUTES[userType]) {
      return NextResponse.redirect(
        new URL(DASHBOARD_ROUTES[userType], request.url)
      );
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect dashboard routes - redirect to login if not authenticated
  if (!isAuthenticated && !isPublicRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user accesses root, redirect to their dashboard
  if (isAuthenticated && pathname === "/") {
    if (userType && DASHBOARD_ROUTES[userType]) {
      return NextResponse.redirect(
        new URL(DASHBOARD_ROUTES[userType], request.url)
      );
    }
  }

  // Role-based route protection
  if (isAuthenticated && userType) {
    // Check if user is accessing a route that doesn't match their type
    const accessingRoute = Object.entries(DASHBOARD_ROUTES).find(([, route]) =>
      pathname.startsWith(route)
    );

    if (accessingRoute) {
      const [routeUserType, routePath] = accessingRoute;

      // If user is accessing a route that's not theirs, redirect to their dashboard
      if (routeUserType !== userType && pathname.startsWith(routePath)) {
        return NextResponse.redirect(
          new URL(DASHBOARD_ROUTES[userType], request.url)
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (all API routes including NextAuth)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
