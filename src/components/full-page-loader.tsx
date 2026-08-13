export function FullPageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div className="size-6 animate-spin rounded-full border-2 border-(--bor2) border-t-(--cy)" />
      <p className="text-xs font-medium text-(--t3)">{label}</p>
    </div>
  );
}
