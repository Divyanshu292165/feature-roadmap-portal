import { env } from '../config/env';

/**
 * Refresh-token cookie options.
 *
 * In production the API and the SPA are typically on different domains
 * (e.g. Render + Vercel), so the cookie must be SameSite=None; Secure to be
 * sent on cross-site requests. Locally we use Lax over http.
 *
 * clearCookie must use the SAME attributes (minus maxAge) or the browser
 * won't remove the cookie on logout.
 */
const isProd = env.NODE_ENV === 'production';

export const REFRESH_COOKIE_NAME = 'refreshToken';
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  maxAge: REFRESH_COOKIE_MAX_AGE,
  path: '/',
};

export const clearRefreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  path: '/',
};
