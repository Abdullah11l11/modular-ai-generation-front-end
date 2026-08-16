import type { Template, ToggleResponse } from '@/types/api';

/**
 * Returns a new Template reflecting the upvote state from the server.
 * Trusts the server's `active` flag — the caller should treat `count` as authoritative.
 */
export function applyUpvoteToggle(template: Template, response: ToggleResponse): Template {
  return {
    ...template,
    is_upvoted: response.active,
    upvote_count: response.count,
  };
}

/**
 * Returns a new Template reflecting the bookmark state from the server.
 */
export function applyBookmarkToggle(template: Template, response: ToggleResponse): Template {
  return {
    ...template,
    is_bookmarked: response.active,
  };
}
