import {useQuery} from '@tanstack/react-query' ;
import { getUserProjects } from '../api/getUserProjects';
import type { Id } from '@/types/api';
export const useUserProjects =(userId:Id)=>
useQuery({
    queryKey:['users' ,userId,'projects'] ,
    queryFn:()=>getUserProjects(userId) ,
})