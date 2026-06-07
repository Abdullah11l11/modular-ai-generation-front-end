import React from 'react' ;
import type {User ,Template ,Resource  } from '@/types/api' ;
import {Tabs ,TabsList ,TabsTrigger ,TabsContent} from '@/components/ui/tabs' ;
import { UserProfileHeader } from '@/features/users/components/UserProfileHeader';
import { UserTemplatesGrid } from '@/features/users/components/UserTemplatesGrid';
import { UserProjectsGrid } from '@/features/users/components/UserProjectsGrid';
import {useParams} from 'react-router-dom' ;
// const mockTemplates: Template[] = [
//   { id: '1', user_id: '1', name: 'Business Pitch Deck', description: null, thumbnail_url: null, visibility: 'public', tags: ['business'], locale: 'en', direction: 'ltr', fork_count: 5, upvote_count: 12, is_upvoted: false, is_bookmarked: false, type: { id: '1', name: 'Presentation', description: '', icon: '' }, created_at: '2026-01-15T10:30:00Z', updated_at: '2026-01-15T10:30:00Z' },
//   { id: '2', user_id: '1', name: 'Social Media Carousel', description: null, thumbnail_url: null, visibility: 'public', tags: ['social'], locale: 'en', direction: 'ltr', fork_count: 3, upvote_count: 8, is_upvoted: false, is_bookmarked: false, type: { id: '2', name: 'Carousel', description: '', icon: '' }, created_at: '2026-01-15T11:00:00Z', updated_at: '2026-01-15T11:00:00Z' },
// ]

// const mockResources: Resource[] = [
//   { id: '1', user_id: '1', name: 'React Prompt Template', kind: 'prompt', description: null, body: '', visibility: 'public', tags: ['react'], fork_count: 3, upvote_count: 8, is_upvoted: false, is_bookmarked: false, created_at: '2026-01-15T10:30:00Z', updated_at: '2026-01-15T10:30:00Z' },
// ]
const MOCK_USER : User = {
 id : "1" ,
 name : 'Sara Ali' ,
 email : 'saraali@gmail.com' ,
 role : 'user' ,
  profile : {
   bio : 'Frontend Developer & UI/UX ' ,
   avatar_url : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D' ,
   website : 'https://ayamgf.dev' ,
   location :  'Aman ,Jorban' ,
 }  ,
  created_at : '2026-01-15T10:30:00Z' ,

}
export function PublicProfilePage() {
  const {userId} =useParams<{userId : string}>()
   return (
   <div className='mx-auto max-w-4xl p-6'>
   <UserProfileHeader user={MOCK_USER } templatesCount={2} resourcesCount={1} upvotesCount={20} />
   <Tabs defaultValue='templates'>
    <TabsList>
      <TabsTrigger value='templates'>Templates</TabsTrigger>
      <TabsTrigger value='projects'>Projects</TabsTrigger>
       </TabsList>
      <TabsContent value='templates'>
        <UserTemplatesGrid userId={userId!}></UserTemplatesGrid>
      </TabsContent>
      <TabsContent value='projects'>
        <UserProjectsGrid userId={userId!}></UserProjectsGrid>
      </TabsContent>
   </Tabs>
   </div>)
}
// export type UserProfile = {
//   bio: string | null
//   avatar_url: string | null
//   website: string | null
//   location: string | null
// }

// export type User = {
//   id: Id
//   name: string
//   email: string
//   role: 'user' | 'admin'
//   profile?: UserProfile
//   created_at: string
// }