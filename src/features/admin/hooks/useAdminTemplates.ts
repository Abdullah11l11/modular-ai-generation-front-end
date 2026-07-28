import { useQuery } from "@tanstack/react-query"

import { listTemplates } from "../api/listAdminTemplates"

export function useAdminTemplates(params?: any) {

    return useQuery({

        queryKey: ["admin", "templates", params],

        queryFn: () => listTemplates(params),

    })

}