import { Link, useNavigate } from 'react-router-dom';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';

export function AuthControl() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  if (isLoading) {
    return <Skeleton className="size-7 rounded-full" aria-label="Loading account" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild variant="accent" size="sm">
          <Link to="/register">Register</Link>
        </Button>
      </div>
    );
  }

  const initial = user.name?.trim().charAt(0).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cy)]"
        aria-label="Account menu"
      >
        <Avatar className="size-7">
          {user.profile?.avatar_url ? (
            <AvatarImage src={user.profile.avatar_url} alt={user.name} />
          ) : null}
          <AvatarFallback className="bg-[var(--acc)] text-xs font-bold text-[var(--sur)]">
            {initial}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              {user.profile?.avatar_url ? (
                <AvatarImage src={user.profile.avatar_url} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-[var(--acc)] text-xs font-bold text-[var(--sur)]">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[var(--t1)]">{user.name}</div>
              <div className="truncate text-xs text-[var(--t3)]">{user.email}</div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={`/users/${user.id}`}>My Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">Settings</Link>
        </DropdownMenuItem>
        {user.role === 'admin' ? (
          <DropdownMenuItem asChild>
            <Link to="/admin">Admin</Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            logout.mutate(undefined, {
              onSuccess: () => navigate('/login', { replace: true }),
            });
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
