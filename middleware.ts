import { fetchAuthSession } from 'aws-amplify/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { runWithAmplifyServerContext } from './lib/amplify-utils';


export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Authentication check
  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return (
          session.tokens?.accessToken !== undefined &&
          session.tokens?.idToken !== undefined
        );
      } catch (error) {
        console.error('Authentication error:', error);
        return false;
      }
    }
  });

  // Check if the user is trying to access the sign-in page
  const isAccessingSignIn = request.nextUrl.pathname === '/sign-in';

  if (authenticated) {
    // If authenticated user tries to access sign-in page, redirect to dashboard
    if (isAccessingSignIn) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // For all other routes, allow access
    return response;
  } else {
    // If unauthenticated user tries to access any protected route, redirect to sign-in
    if (!isAccessingSignIn) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    // Allow unauthenticated access to sign-in page
    return response;
  }
}

// Updated config to include sign-in page in middleware
export const config = {
  matcher: [
    // Include all routes, including sign-in
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};