import type { User } from '@/types/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserProfileHeader } from '@/features/users/components/UserProfileHeader';
import { UserTemplatesGrid } from '@/features/users/components/UserTemplatesGrid';
import { UserProjectsGrid } from '@/features/users/components/UserProjectsGrid';
import { useParams } from 'react-router-dom';
const MOCK_USER: User = {
  id: '1',
  name: 'Sara Ali',
  email: 'saraali@gmail.com',
  role: 'user',
  profile: {
    bio: 'Frontend Developer & UI/UX ',
    avatar_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D',
    website: 'https://ayamgf.dev',
    location: 'Aman ,Jorban',
  },
  created_at: '2026-01-15T10:30:00Z',
};
export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  return (
    <div className="mx-auto max-w-4xl p-6">
      <UserProfileHeader user={MOCK_USER} templatesCount={2} resourcesCount={1} upvotesCount={20} />
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="templates">
          <UserTemplatesGrid userId={userId!}></UserTemplatesGrid>
        </TabsContent>
        <TabsContent value="projects">
          <UserProjectsGrid userId={userId!}></UserProjectsGrid>
        </TabsContent>
      </Tabs>
    </div>
  );
}
