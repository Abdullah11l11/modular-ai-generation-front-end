import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BookmarkIcon,
  HeartIcon,
  GitForkIcon,
} from 'lucide-react';
import { useTemplate } from '@/features/templates/hooks/useTemplate';
import { useTemplateFiles } from '@/features/files/hooks/useTemplateFiles';
import { useToggleUpvote } from '@/features/social/hooks/useToggleUpvote';
import { useToggleBookmark } from '@/features/social/hooks/useToggleBookmark';
import { useMe } from '@/features/me/hooks/useMe';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ErrorFallback } from '@/components/error-fallback';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorChip } from '@/features/users/components/AuthorChip';
import { TemplatePreviewPanel } from '@/features/templates/components/TemplatePreviewPanel';
import { TemplateFileList } from '@/features/templates/components/TemplateFileList';
import { CommentsSection } from '@/features/social/components/CommentsSection';
import { RelatedTemplatesStrip } from '@/features/templates/components/RelatedTemplatesStrip';
import { ForkTemplateModal } from '@/features/templates/components/ForkTemplateModal';
import { applyBookmarkToggle, applyUpvoteToggle } from '@/features/templates/lib/cacheMutations';
import { useQueryClient } from '@tanstack/react-query';
import { toastError } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';
import type { Template } from '@/types/api';

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="aspect-video w-full rounded-xl" />
    </div>
  );
}

export function TemplateDetailPage() {
  const { templateId = '' } = useParams<{ templateId: string }>();
  const { data: template, isLoading, error, refetch } = useTemplate(templateId);
  const { data: filesData, isLoading: filesLoading, error: filesError } = useTemplateFiles(templateId);
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const upvote = useToggleUpvote();
  const bookmark = useToggleBookmark();
  const [forkOpen, setForkOpen] = useState(false);

  const isOwner = !!template && !!me && template.user_id === me.id;

  const handleUpvote = () => {
    if (!template) return;
    const previous = queryClient.getQueryData<Template>(['templates', template.id]);
    if (previous) {
      const optimisticActive = !previous.is_upvoted;
      const optimisticCount = previous.upvote_count + (optimisticActive ? 1 : -1);
      queryClient.setQueryData<Template>(['templates', template.id], {
        ...previous,
        is_upvoted: optimisticActive,
        upvote_count: optimisticCount,
      });
    }
    upvote.mutate(
      { target: 'templates', targetId: template.id },
      {
        onSuccess: (response) => {
          const cached = queryClient.getQueryData<Template>(['templates', template.id]);
          if (cached) {
            queryClient.setQueryData<Template>(
              ['templates', template.id],
              applyUpvoteToggle(cached, response),
            );
          }
        },
        onError: () => {
          if (previous) queryClient.setQueryData(['templates', template.id], previous);
          toastError('Could not save vote');
        },
      },
    );
  };

  const handleBookmark = () => {
    if (!template) return;
    const previous = queryClient.getQueryData<Template>(['templates', template.id]);
    if (previous) {
      queryClient.setQueryData<Template>(['templates', template.id], {
        ...previous,
        is_bookmarked: !previous.is_bookmarked,
      });
    }
    bookmark.mutate(
      { target: 'templates', targetId: template.id },
      {
        onSuccess: (response) => {
          const cached = queryClient.getQueryData<Template>(['templates', template.id]);
          if (cached) {
            queryClient.setQueryData<Template>(
              ['templates', template.id],
              applyBookmarkToggle(cached, response),
            );
          }
        },
        onError: () => {
          if (previous) queryClient.setQueryData(['templates', template.id], previous);
          toastError('Could not save bookmark');
        },
      },
    );
  };

  if (isLoading) return <DetailSkeleton />;
  if (error || !template) {
    return (
      <div className="mx-auto max-w-5xl space-y-3 p-6">
        <ErrorFallback
          error={error as Error}
          reset={refetch}
        />
        <Button asChild variant="ghost" size="sm">
          <Link to="/templates">
            <ArrowLeftIcon className="size-4" />
            Back to templates
          </Link>
        </Button>
      </div>
    );
  }

  const filesList = filesData && 'data' in filesData ? filesData.data : [];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/templates">
            <ArrowLeftIcon className="size-4" />
            Templates
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--t1)]">{template.name}</h1>
              <Badge variant="outline">{template.visibility}</Badge>
              <Badge variant="secondary">
                <GitForkIcon className="mr-1 size-3" />
                {formatNumber(template.fork_count)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOwner ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpvote}
                  disabled={upvote.isPending}
                  aria-pressed={template.is_upvoted}
                >
                  <HeartIcon
                    className={cn('size-4', template.is_upvoted && 'fill-current text-[var(--cy)]')}
                  />
                  {formatNumber(template.upvote_count)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmark}
                  disabled={bookmark.isPending}
                  aria-pressed={template.is_bookmarked}
                >
                  <BookmarkIcon
                    className={cn('size-4', template.is_bookmarked && 'fill-current text-[var(--cy)]')}
                  />
                </Button>
              </>
            ) : null}
            <Button variant="accent" size="sm" onClick={() => setForkOpen(true)}>
              Use this template
            </Button>
          </div>
        </div>

        {template.author ? (
          <div className="flex flex-wrap items-center gap-2">
            <AuthorChip author={template.author} createdAt={template.created_at} />
            {template.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                <Link to={`/templates?tags=${encodeURIComponent(tag)}`} className="no-underline">
                  {tag}
                </Link>
              </Badge>
            ))}
            <Badge variant="outline">{template.direction.toUpperCase()}</Badge>
          </div>
        ) : null}
      </div>

      <TemplatePreviewPanel
        files={filesError ? undefined : filesList}
        direction={template.direction}
        isLoading={filesLoading}
      />

      {template.description ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--t1)]">Description</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--t2)]">
            {template.description}
          </p>
        </section>
      ) : null}

      {!filesError && filesList.length > 0 ? (
        <TemplateFileList files={filesList} direction={template.direction} />
      ) : null}

      <CommentsSection target="templates" targetId={template.id} />

      <RelatedTemplatesStrip template={template} />

      <ForkTemplateModal
        template={template}
        open={forkOpen}
        onOpenChange={setForkOpen}
      />
    </div>
  );
}
