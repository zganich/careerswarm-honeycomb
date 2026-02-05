import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

/**
 * Session cookie options. Use sameSiteForEmailLogin for email sign-in (same-site form POST)
 * so the cookie is set and sent on redirect; use default for OAuth callback (cross-site redirect).
 */
export function getSessionCookieOptions(
  req: Request,
  sameSiteForEmailLogin?: boolean
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const secure = isSecureRequest(req);
  // Email login: same-site form POST → use "lax" so cookie is accepted and sent on next navigation.
  // OAuth callback: cross-site redirect → use "none" so cookie is accepted when returning from IdP.
  const sameSite =
    sameSiteForEmailLogin || !secure ? "lax" : "none";
  return {
    httpOnly: true,
    path: "/",
    sameSite,
    secure,
  };
}
