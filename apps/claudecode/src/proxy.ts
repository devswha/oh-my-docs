import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

export default createI18nMiddleware(i18n);

export const config = {
  // Skip i18n rewrites for static assets served from /public.
  // Without this, asset URLs like /logo.png can be rewritten to /en/logo.png and 404.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|webp|jpg|jpeg|gif|txt|xml|json|woff2?|ttf)).*)',
  ],
};
