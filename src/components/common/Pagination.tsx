import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({
  page,

  totalPages,

  onChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-end gap-2 mt-6">
      <Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm">
        Page {page} of {totalPages}
      </span>

      <Button variant="outline" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
