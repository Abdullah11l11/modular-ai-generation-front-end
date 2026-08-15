import { useParams } from 'react-router-dom';
import { CommentThread } from '@/features/social/components/CommentThread';

export function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId?: string }>();

  if (!templateId) {
    return null;
  }

  return (
    <main>
      {/* Template information */}

      {/* Template preview */}

      {/* Template metadata */}

      <section className="mx-auto mt-10 max-w-[1180px] px-6 pb-16">
        <CommentThread
          target="templates"
          targetId={templateId}
          currentUserId={undefined}
        />
      </section>
    </main>
  );
}
