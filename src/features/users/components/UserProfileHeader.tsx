import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import type { User } from '@/types/api';

type UserProfileHeaderProps = {
  user: User;
  templatesCount?: number;
  projectsCount?: number;
  resourcesCount?: number;
  isOwner?: boolean;
};

export function UserProfileHeader({
  user,
  templatesCount,
  projectsCount,
  resourcesCount,
  isOwner,
}: UserProfileHeaderProps) {
  const initials = user.name.slice(0, 2);
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
  return (
    <div className="flex items-start gap-4 p-6">
      <Avatar className="h-16 w-16">
        <AvatarImage src={user.profile?.avatar_url ?? undefined} className="object-cover" />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          {isOwner && (
            <Button asChild variant="outline" size="sm">
              <Link to="/settings">
                <Settings className="size-4" />
                Edit profile
              </Link>
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-500">{user.email.split('@')[0]}</p>
        {user.profile?.bio && <p className="text-sm">{user.profile.bio}</p>}
        <div className="my-3 flex gap-6">
          <p className="text-sm">
            <strong className="text-base">{templatesCount ?? 0}</strong> Templates
          </p>
          <p className="text-sm">
            <strong className="text-base">{projectsCount ?? 0}</strong> Projects
          </p>
          <p className="text-sm">
            <strong className="text-base">{resourcesCount ?? 0}</strong> Resources
          </p>
        </div>
        {user.profile?.location && <p className="text-sm text-gray-500">{user.profile.location}</p>}
        {user.profile?.website && <p className="text-sm text-blue-500">{user.profile.website}</p>}
        <p className="text-xs text-gray-400">Joined {joinDate}</p>
      </div>
    </div>
  );
}
