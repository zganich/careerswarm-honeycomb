import { describe, it, expect } from 'vitest';

// These tests verify E2E credentials are configured.
// Skip if credentials aren't set (they're optional for local development).
const hasE2ECredentials = process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD;

describe.skipIf(!hasE2ECredentials)('E2E Test Credentials', () => {
  it('should have TEST_USER_EMAIL environment variable set', () => {
    expect(process.env.TEST_USER_EMAIL).toBeDefined();
    expect(process.env.TEST_USER_EMAIL).not.toBe('');
    expect(process.env.TEST_USER_EMAIL).toMatch(/@/); // Should be a valid email format
  });

  it('should have TEST_USER_PASSWORD environment variable set', () => {
    expect(process.env.TEST_USER_PASSWORD).toBeDefined();
    expect(process.env.TEST_USER_PASSWORD).not.toBe('');
    expect(process.env.TEST_USER_PASSWORD!.length).toBeGreaterThanOrEqual(6); // Minimum password length for testing
  });

  it('should have valid email format for TEST_USER_EMAIL', () => {
    const email = process.env.TEST_USER_EMAIL!;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(email)).toBe(true);
  });
});
