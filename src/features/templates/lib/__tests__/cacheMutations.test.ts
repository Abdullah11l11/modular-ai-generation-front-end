import { describe, expect, it } from 'vitest';
import type { Template } from '@/types/api';
import { applyBookmarkToggle, applyUpvoteToggle } from '../cacheMutations';

const baseTemplate: Template = {
  id: 't1',
  user_id: 'u1',
  author: { id: 'u1', name: 'Alice', avatar_url: null },
  name: 'Acme Pitch',
  description: null,
  thumbnail_url: null,
  visibility: 'public',
  tags: [],
  locale: 'en',
  direction: 'ltr',
  fork_count: 5,
  upvote_count: 12,
  is_upvoted: false,
  is_bookmarked: false,
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-01T00:00:00Z',
};

describe('applyUpvoteToggle', () => {
  it('flips is_upvoted to true and sets count to server value', () => {
    const result = applyUpvoteToggle(baseTemplate, { upvoted: true, upvote_count: 13 });
    expect(result.is_upvoted).toBe(true);
    expect(result.upvote_count).toBe(13);
  });

  it('flips is_upvoted to false and decrements count to server value', () => {
    const t = { ...baseTemplate, is_upvoted: true, upvote_count: 12 };
    const result = applyUpvoteToggle(t, { upvoted: false, upvote_count: 11 });
    expect(result.is_upvoted).toBe(false);
    expect(result.upvote_count).toBe(11);
  });

  it('does not mutate the input', () => {
    const before = JSON.stringify(baseTemplate);
    applyUpvoteToggle(baseTemplate, { upvoted: true, upvote_count: 13 });
    expect(JSON.stringify(baseTemplate)).toBe(before);
  });
});

describe('applyBookmarkToggle', () => {
  it('flips is_bookmarked to true', () => {
    const result = applyBookmarkToggle(baseTemplate, { bookmarked: true });
    expect(result.is_bookmarked).toBe(true);
  });

  it('flips is_bookmarked to false', () => {
    const t = { ...baseTemplate, is_bookmarked: true };
    const result = applyBookmarkToggle(t, { bookmarked: false });
    expect(result.is_bookmarked).toBe(false);
  });
});
