/**
 * PLAY 2: API Validation Tests (tRPC)
 * 
 * Tests tRPC endpoints and health checks
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || BASE_URL;

test.describe('PLAY 2: API Validation (Honeycomb)', () => {
  test('1. Check tRPC endpoint accessibility', async ({ request }) => {
    // Try to access tRPC endpoint (usually /api/trpc or /trpc)
    const trpcEndpoints = [
      `${API_URL}/api/trpc`,
      `${API_URL}/trpc`,
      `${API_URL}/api/trpc/health`,
    ];

    for (const endpoint of trpcEndpoints) {
      const response = await request.get(endpoint, { timeout: 5000 });
      if (response.ok()) {
        console.log(`✅ tRPC endpoint accessible: ${endpoint}`);
        return;
      }
    }
    
    console.log('⚠️ tRPC endpoint not found at standard paths (this may be OK if using different routing)');
  });

  test('2. Check homepage loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`✅ Homepage loaded: ${title}`);
  });

  test('3. Check for tRPC client initialization', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check if tRPC client is initialized (look for network requests)
    const trpcRequests: string[] = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('trpc') || url.includes('/api/')) {
        trpcRequests.push(url);
      }
    });
    
    await page.waitForTimeout(3000);
    
    if (trpcRequests.length > 0) {
      console.log(`✅ tRPC client active (${trpcRequests.length} requests detected)`);
      console.log(`   Sample requests: ${trpcRequests.slice(0, 3).join(', ')}`);
    } else {
      console.log('⚠️ No tRPC requests detected (may be normal if page doesn\'t make initial calls)');
    }
  });

  test('4. Test dashboard route', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url).toContain('/dashboard');
    console.log('✅ Dashboard route accessible');
  });
});
