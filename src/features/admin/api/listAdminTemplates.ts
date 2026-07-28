import { apiClient } from '@/lib/api/client'

import type { AdminTemplate } from "@/features/admin/types/adminTemplate"

import type { AdminTemplatesParams } from "@/features/admin/types/adminTemplatesParams"

export async function listTemplates(
    params?: AdminTemplatesParams,
) {

    const  data = await apiClient.get<AdminTemplate[]>(
        "/admin/templates",
        {
            params:params as any
        },
    )

    return data

}