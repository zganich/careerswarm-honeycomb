# Cloudflare DNS for CareerSwarm

Point careerswarm.com and www to Railway. **Railway target:** `careerswarm-app-production.up.railway.app`

**Use CLI/API every time there is access.** Prefer Cloudflare API (curl) over the dashboard.

---

## Option 1: Cloudflare API (CLI)

Requires `CLOUDFLARE_API_TOKEN` with Zone → DNS → Edit permission, and your zone ID.

```bash
# Get zone ID
curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=careerswarm.com" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq '.result[0].id'

# Create CNAME for root (@)
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"@","content":"careerswarm-app-production.up.railway.app","proxied":true}'

# Create CNAME for www
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"www","content":"careerswarm-app-production.up.railway.app","proxied":true}'
```

SSL/TLS: set to **Full** or **Full (strict)** in the Cloudflare dashboard (no API for SSL mode).

---

## Option 2: Cloudflare Dashboard

1. **Open Cloudflare** → [dash.cloudflare.com](https://dash.cloudflare.com) → select **careerswarm.com**.

2. **Go to DNS** → **Records** tab.

3. **Add or update these records** (same as API above):

   | Type  | Name  | Target                                      | Proxy                     |
   | ----- | ----- | ------------------------------------------- | ------------------------- |
   | CNAME | `@`   | `careerswarm-app-production.up.railway.app` | Grey (DNS only) or Orange |
   | CNAME | `www` | `careerswarm-app-production.up.railway.app` | Grey (DNS only) or Orange |

   **Note:** For root (`@`), some plans need ALIAS/ANAME instead of CNAME. If CNAME fails at root, use the record type your plan supports for apex domains.

4. **Proxy (orange vs grey cloud):**
   - **Orange (Proxied):** CDN, DDoS protection; start here.
   - **Grey (DNS only):** Use if you see SSL or redirect issues.

5. **SSL/TLS** (Cloudflare sidebar):
   - Set to **Full** or **Full (strict)** so Cloudflare → Railway uses HTTPS.

6. **Propagation:** Wait a few minutes, then:
   ```bash
   curl -I https://careerswarm.com
   curl -I https://www.careerswarm.com
   ```

---

## Troubleshooting

- **Redirect loops:** Switch root/www to grey (DNS only) or adjust SSL mode.
- **502 Bad Gateway:** Check Railway logs (`railway logs`) and that the app is running.
- **Railway domains:** `railway domain` should list careerswarm.com and www.careerswarm.com.
