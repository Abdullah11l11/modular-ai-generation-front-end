import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMe } from '@/features/me/hooks/useMe';
import { useUpdateProfile } from '@/features/me/hooks/useUpdateProfile';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { User, KeyRound, Check, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/settings', label: 'Profile', icon: User, end: true },
  { to: '/settings/ai-providers', label: 'AI providers', icon: KeyRound, end: false },
  { to: '/skill', label: 'Skill bundle', icon: Download, end: true },
];

export function SettingsPage() {
  const { data: me, isLoading } = useMe();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const location = useLocation();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [location_, setLocation] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!me) return;
    setName(me.name);
    setBio(me.profile?.bio ?? '');
    setAvatarUrl(me.profile?.avatar_url ?? '');
    setWebsite(me.profile?.website ?? '');
    setLocation(me.profile?.location ?? '');
  }, [me]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        website: website.trim() || null,
        location: location_.trim() || null,
      });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Profile saved');
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      toast.error('Failed to save profile');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="text-(--t2)">You must be signed in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <PageHeader title="Settings" subtitle="Manage your account and integrations." />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-(--cy-d) text-(--cy)'
                    : 'text-(--t2) hover:bg-(--sur) hover:text-(--t1)',
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is what other people see across the site. Your email stays private.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={avatarUrl || undefined} className="object-cover" />
                  <AvatarFallback className="text-lg">
                    {name.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-medium text-(--t2)">Avatar URL</label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-(--t2)">Display name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  maxLength={80}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-(--t2)">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A line or two about you."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-[10px] text-(--t3)">{bio.length} / 500</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-(--t2)">Location</label>
                  <Input
                    value={location_}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    maxLength={120}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-(--t2)">Website</label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yoursite.com"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-(--t2)">Email</label>
                <Input value={me.email} disabled className="bg-(--sur2)" />
                <p className="text-[10px] text-(--t3)">
                  Email is managed by your account and cannot be changed here.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-2">
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs text-(--cy)">
                <Check className="size-3.5" />
                Saved
              </span>
            )}
            <Button type="submit" disabled={updateProfile.isPending || !name.trim()}>
              {updateProfile.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
