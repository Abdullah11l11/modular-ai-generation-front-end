import { Inbox } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex h-72 flex-col items-center justify-center">
      <Inbox size={50} className="mb-4 text-muted-foreground" />

      <h2 className="font-semibold">No Data</h2>

      <p className="text-muted-foreground">Nothing found.</p>
    </div>
  );
}
