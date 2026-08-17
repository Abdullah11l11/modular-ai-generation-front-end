import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/page-header';
import { CreateResourceForm } from '@/features/resources/components/CreateResourceForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CreateResourcePage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/resources">
          <ArrowLeft className="size-4" />
          Back to resources
        </Link>
      </Button>
      <PageHeader
        title="New resource"
        subtitle="Add a prompt, skill, agent, rule, MCP, design doc, or hook to the library."
      />
      <CreateResourceForm />
    </div>
  );
}
