import { describe, it, expect } from 'vitest';
import { BcryptHasher } from '../BcryptHasher.js';

describe('BcryptHasher', () => {
  const hasher = new BcryptHasher();

  describe('hash', () => {
    it('should return a bcrypt hash string', async () => {
      const hash = await hasher.hash('password123');

      expect(hash).toMatch(/^\$2[aby]?\$/);
      expect(hash).not.toBe('password123');
    });

    it('should produce different hashes for the same input (salt)', async () => {
      const hash1 = await hasher.hash('password123');
      const hash2 = await hasher.hash('password123');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verify', () => {
    it('should return true for correct password', async () => {
      const hash = await hasher.hash('correct-password');
      const result = await hasher.verify('correct-password', hash);

      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const hash = await hasher.hash('correct-password');
      const result = await hasher.verify('wrong-password', hash);

      expect(result).toBe(false);
    });
  });
});
