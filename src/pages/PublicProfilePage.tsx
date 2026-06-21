import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfileHeader } from '@/features/users/components/UserProfileHeader';
import { useUserProjects } from '@/features/users/hooks/useUserProjects';
import { useUserTemplates } from '@/features/users/hooks/useUserTemplates';
import { UserTemplatesGrid } from '@/features/users/components/UserTemplatesGrid';
import { UserProjectsGrid } from '@/features/users/components/UserProjectsGrid';
import { useParams } from 'react-router-dom';
import { useUser } from '@/features/users/hooks/useUser';

export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { data: templatesData } = useUserTemplates(userId as string);
  const { data: projectsData } = useUserProjects(userId as string);
  const { data: user, isLoading, error } = useUser(userId as string);
  if (isLoading)
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  if (error || !user) return <p className="p-6 text-red-600">Failed to load user</p>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <UserProfileHeader
        user={user}
        templatesCount={templatesData?.meta.total}
        projectsCount={projectsData?.meta.total}
        upvotesCount={20}
      />
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="templates">
          <UserTemplatesGrid userId={userId! as string}></UserTemplatesGrid>
        </TabsContent>
        <TabsContent value="projects">
          <UserProjectsGrid userId={userId! as string}></UserProjectsGrid>
        </TabsContent>
      </Tabs>
    </div>
  );
}
