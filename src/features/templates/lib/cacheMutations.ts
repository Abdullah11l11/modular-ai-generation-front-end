import type { BookmarkResponse, Resource, Template, UpvoteResponse } from '@/types/api';

/**
 * Returns a new entity reflecting the upvote state from the server.
 * Trusts the server's `upvoted` flag and `upvote_count` (both authoritative).
 *
 * Overloaded so callers get a narrowed return type that matches the
 * concrete cache slot they read from (Template | Resource).
 */
export function applyUpvoteToggle(template: Template, response: UpvoteResponse): Template;
export function applyUpvoteToggle(resource: Resource, response: UpvoteResponse): Resource;
export function applyUpvoteToggle(
  entity: Template | Resource,
  response: UpvoteResponse,
): Template | Resource {
  return {
    ...entity,
    is_upvoted: response.upvoted,
    upvote_count: response.upvote_count,
  };
}

/**
 * Returns a new entity reflecting the bookmark state from the server.
 */
export function applyBookmarkToggle(template: Template, response: BookmarkResponse): Template;
export function applyBookmarkToggle(resource: Resource, response: BookmarkResponse): Resource;
export function applyBookmarkToggle(
  entity: Template | Resource,
  response: BookmarkResponse,
): Template | Resource {
  return {
    ...entity,
    is_bookmarked: response.bookmarked,
  };
}
