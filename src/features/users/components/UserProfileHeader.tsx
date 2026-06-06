import {Avatar ,AvatarImage , AvatarFallback} from   "@/components/ui/avatar"; 
import type {User} from '@/types/api' ;
type UserProfileHeaderProps  = {
    user : User ,
} ;
export function UserProfileHeader ({user} : UserProfileHeaderProps) {
const initials =user.name.slice(0,2) ;
const joinDate =new Date(user.created_at).toLocaleDateString('en-US',{
    year: 'numeric' ,
    month : 'long' ,
})
return (
    <div className="flex items-start gap-4 p-6">
        <Avatar className="h-16 w-16">
            <AvatarImage src={user.profile?.avatar_url ?? undefined} className="object-cover"/>
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email.split('@')[0]}</p>
            {user.profile?.bio && <p className="text-sm">{user.profile.bio}</p>}
            {user.profile?.location && <p className="text-sm text-gray-500">{user.profile.location}</p>}
            {user.profile?.website && <p className="text-sm text-blue-500">{user.profile.website}</p>}
            <p className="text-xs text-gray-400">Joined {joinDate}</p>
        </div>
    </div>
)
}