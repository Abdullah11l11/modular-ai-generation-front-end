import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { CreateTemplateForm } from '@/features/templates/components/CreateTemplateForm';

export function CreateTemplatePage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/templates">
          <ArrowLeft className="size-4" />
          Back to templates
        </Link>
      </Button>
      <PageHeader
        title="New template"
        subtitle="Create a template to share or reuse. You can add files on the next screen."
      />
      <CreateTemplateForm />
    </div>
  );
}