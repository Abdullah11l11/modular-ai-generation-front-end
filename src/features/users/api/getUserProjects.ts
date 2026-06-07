import {apiClient} from '@/lib/api/client' ;
import type {Id , PaginatedResponse ,Project} from '@/types/api' ;
export const getUserProjects = (userId:Id)=> 
apiClient.get<PaginatedResponse<Project>>(`users/${userId}/projects`) ;
