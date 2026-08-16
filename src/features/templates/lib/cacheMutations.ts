import type { BookmarkResponse, Template, UpvoteResponse } from '@/types/api';

/**
 * Returns a new Template reflecting the upvote state from the server.
 * Trusts the server's `upvoted` flag and `upvote_count` (both authoritative).
 */
export function applyUpvoteToggle(template: Template, response: UpvoteResponse): Template {
  return {
    ...template,
    is_upvoted: response.upvoted,
    upvote_count: response.upvote_count,
  };
}

/**
 * Returns a new Template reflecting the bookmark state from the server.
 */
export function applyBookmarkToggle(template: Template, response: BookmarkResponse): Template {
  return {
    ...template,
    is_bookmarked: response.bookmarked,
  };
}
