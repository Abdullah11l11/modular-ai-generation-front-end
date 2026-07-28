import { apiClient } from '@/lib/api/client'

import type { UpdateUserRoleRequest } from "@/features/admin/types/updateRoleRequest"

export async function updateUserRole(

    id: number,

    body: UpdateUserRoleRequest,

) {

    const data = await apiClient.put(

        `/admin/users/${id}/role`,

        body,

    )

    return data

}