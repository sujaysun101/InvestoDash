export const DEMO_COOKIE_NAME = "investodash_demo";
export const DEMO_COOKIE_VALUE = "1";
export const DEMO_USER_ID = "demo-user";
export const DEMO_USER_EMAIL = "demo@investodash.local";

export function isInternalDemoEnabled() {
  return process.env.ENABLE_INTERNAL_DEMO === "true";
}

export function hasDemoCookie(cookieValue?: string | null) {
  return isInternalDemoEnabled() && cookieValue === DEMO_COOKIE_VALUE;
}
