import { describe, it, expect } from 'vitest';
import { JwtService } from '../JwtService.js';

const TEST_SECRET = 'test-secret-key-that-is-at-least-32-chars-long!';

describe('JwtService', () => {
  const jwt = new JwtService(TEST_SECRET, '15m');

  describe('generateAccessToken', () => {
    it('should return a JWT string with 3 parts', async () => {
      const token = await jwt.generateAccessToken({ userId: 'user-1', role: 'viewer' });

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should return payload for valid token', async () => {
      const token = await jwt.generateAccessToken({ userId: 'user-1', role: 'admin' });
      const payload = await jwt.verifyAccessToken(token);

      expect(payload).not.toBeNull();
      expect(payload!.userId).toBe('user-1');
      expect(payload!.role).toBe('admin');
    });

    it('should return null for expired token', async () => {
      // Create a service with 0s (zero seconds) expiry
      const shortJwt = new JwtService(TEST_SECRET, '1s');
      const token = await shortJwt.generateAccessToken({ userId: 'user-1', role: 'viewer' });

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const payload = await shortJwt.verifyAccessToken(token);
      expect(payload).toBeNull();
    });

    it('should return null for invalid token', async () => {
      const payload = await jwt.verifyAccessToken('invalid.token.string');

      expect(payload).toBeNull();
    });

    it('should return null for token signed with different secret', async () => {
      const otherJwt = new JwtService('another-secret-key-that-is-at-least-32-chars!!', '15m');
      const token = await otherJwt.generateAccessToken({ userId: 'user-1', role: 'viewer' });

      const payload = await jwt.verifyAccessToken(token);
      expect(payload).toBeNull();
    });
  });

  describe('generateRefreshToken', () => {
    it('should return a UUID string', () => {
      const token = jwt.generateRefreshToken();

      expect(typeof token).toBe('string');
      expect(token).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should return different tokens on each call', () => {
      const token1 = jwt.generateRefreshToken();
      const token2 = jwt.generateRefreshToken();

      expect(token1).not.toBe(token2);
    });
  });
});
