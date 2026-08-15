import { CommentThread } from '@/features/social/components/CommentThread';

export function ResourceDetailPage() {
  const { resourceId } = useParams();

  const currentUser = { id: undefined };

  if (!resourceId) {
    return null;
  }

  return (
    <main>
      {/* Resource information */}

      <section className="mx-auto mt-10 max-w-[1180px] px-6 pb-16">
        <CommentThread
          target="resources"
          targetId={resourceId}
          currentUserId={currentUser?.id}
        />
      </section>
    </main>
  );
}

function useParams(): { resourceId: any; } {
  const path = window.location.pathname;
  const match = path.match(/\/resources\/([^/?#]+)/i);

  return {
    resourceId: match ? match[1] : null,
  };
}
