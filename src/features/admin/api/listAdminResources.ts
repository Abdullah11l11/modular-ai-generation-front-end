import {apiClient} from '@/lib/api/client'

import type { AdminResourcesParams } from "@/features/admin/types/adminResourcesParams"

import type { AdminResource } from "@/features/admin/types/adminResource"

export async function listResources(
    params?: AdminResourcesParams,
) {

    const  data  = await apiClient.get<AdminResource[]>(
        "/admin/resources",
        {
            params:params as any
        },
    )

    return data

}