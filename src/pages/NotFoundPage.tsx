import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="text-[66px] font-extrabold leading-none tracking-tight text-(--cy)">404</p>
      <h1 className="text-[26px] font-extrabold tracking-tight text-(--t1)">Page not found</h1>
      <p className="max-w-xs text-sm text-(--t2)">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/">Go home</Link>
      </Button>
    </div>
  );
}
