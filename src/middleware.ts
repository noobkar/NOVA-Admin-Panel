// This file is intentionally empty - authentication is handled client-side
// We're using localStorage for auth tokens instead of cookies to avoid redirect loops

export function middleware() {
  // No middleware - using client-side auth with localStorage only
  return;
}

export const config = {
  matcher: []
}; 