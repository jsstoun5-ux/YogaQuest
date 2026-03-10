/**
 * Simple Test to verify vitest is working
 * Using explicit imports from vitest
 */
import { describe, it, expect } from '../../node_modules/vitest/dist/index.js';

describe('Simple Math Tests', () => {
  it('should add numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should concatenate strings', () => {
    expect('hello' + ' world').toBe('hello world');
  });
});
