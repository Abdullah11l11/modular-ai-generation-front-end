import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfileHeader } from '@/features/users/components/UserProfileHeader';
import { useUserProjects } from '@/features/users/hooks/useUserProjects';
import { useUserTemplates } from '@/features/users/hooks/useUserTemplates';
import { useUserResources } from '@/features/users/hooks/useUserResources';
import { UserTemplatesGrid } from '@/features/users/components/UserTemplatesGrid';
import { UserProjectsGrid } from '@/features/users/components/UserProjectsGrid';
import { UserResourcesGrid } from '@/features/users/components/UserResourcesGrid';
import { useParams } from 'react-router-dom';
import { useUser } from '@/features/users/hooks/useUser';
import { useMe } from '@/features/me/hooks/useMe';

export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { data: templatesData } = useUserTemplates(userId as string);
  const { data: projectsData } = useUserProjects(userId as string);
  const { data: resourcesData } = useUserResources(userId as string);
  const { data: user, isLoading, error } = useUser(userId as string);
  const { data: me } = useMe();

  if (isLoading)
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  if (error || !user) return <p className="p-6 text-red-600">Failed to load user</p>;

  const isOwner = !!me && me.id === user.id;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <UserProfileHeader
        user={user}
        templatesCount={templatesData?.meta.total}
        projectsCount={projectsData?.meta.total}
        resourcesCount={resourcesData?.meta.total}
        isOwner={isOwner}
      />
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        <TabsContent value="templates">
          <UserTemplatesGrid userId={userId! as string} />
        </TabsContent>
        <TabsContent value="projects">
          <UserProjectsGrid userId={userId! as string} />
        </TabsContent>
        <TabsContent value="resources">
          <UserResourcesGrid userId={userId! as string} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
