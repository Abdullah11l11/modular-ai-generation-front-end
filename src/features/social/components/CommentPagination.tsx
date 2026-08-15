import { Button } from '@/components/ui/button';

interface CommentPaginationProps {
  currentPage: number;
  lastPage: number;
  isPending?: boolean;
  onPageChange: (page: number) => void;
}

export function CommentPagination({
  currentPage,
  lastPage,
  isPending = false,
  onPageChange,
}: CommentPaginationProps) {
  if (lastPage <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1 || isPending}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>

      <span className="px-2 text-xs text-muted-foreground">
        Page {currentPage} of {lastPage}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= lastPage || isPending}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}