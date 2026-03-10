import { test as vitestTest, expect as vitestExpect } from 'vitest';

vitestTest('simple math works', () => {
  vitestExpect(1 + 1).toBe(2);
});

vitestTest('string concatenation works', () => {
  vitestExpect('hello' + ' world').toBe('hello world');
});
