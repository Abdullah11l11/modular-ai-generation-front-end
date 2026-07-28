import { apiClient } from '@/lib/api/client'

import type { AdminUsersParams } from "@/features/admin/types/adminUsersParams"

import type { AdminUser } from "@/features/admin/types/adminUser"

export async function listUsers(
    params?: AdminUsersParams,
) {

    const  data  = await apiClient.get<AdminUser[]>(
        "/admin/users",
        {
           params:params as any
        },
    )

    return data

}