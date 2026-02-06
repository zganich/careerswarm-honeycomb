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
  const sameSite = sameSiteForEmailLogin || !secure ? "lax" : "none";
  const hostname = (req.hostname || req.headers.host || "").split(":")[0];
  // Production: set domain so cookie works for apex and www (e.g. .careerswarm.com)
  const domain =
    hostname &&
    !LOCAL_HOSTS.has(hostname) &&
    !isIpAddress(hostname) &&
    hostname.includes(".")
      ? `.${hostname.replace(/^www\./, "")}`
      : undefined;
  return {
    httpOnly: true,
    path: "/",
    sameSite,
    secure,
    ...(domain && { domain }),
  };
}
