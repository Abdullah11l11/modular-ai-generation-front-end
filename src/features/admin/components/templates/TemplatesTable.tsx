import { useState } from 'react';

import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

import { Card } from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useAdminTemplates } from '@/features/admin/hooks/useAdminTemplates';

import { Pagination } from '@/components/common/Pagination';

import { LoadingState } from '@/features/admin/components/shared/LoadingState';

import { EmptyState } from '@/features/admin/components/shared/EmptyState';

export function TemplatesTable() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminTemplates({
    page,
    q: search || undefined,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  const items = data?.data ?? [];

  if (!items.length) {
    return <EmptyState />;
  }

  return (
    <Card className="p-6 space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4" />

        <Input
          placeholder="Search template..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>

            <TableHead>Author</TableHead>

            <TableHead>Type</TableHead>

            <TableHead>Visibility</TableHead>

            <TableHead>Upvotes</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((template) => (
            <TableRow key={template.id}>
              <TableCell>{template.name}</TableCell>

              <TableCell>{template.author?.name ?? ''}</TableCell>

              <TableCell>{template.type?.name ?? ''}</TableCell>

              <TableCell>{template.visibility}</TableCell>

              <TableCell>{template.upvote_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination page={page} totalPages={data?.meta?.last_page ?? 1} onChange={setPage} />
    </Card>
  );
}
