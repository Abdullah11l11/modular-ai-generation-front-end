import { useQuery } from "@tanstack/react-query"

import { listResources } from "../api/listAdminResources"

export function useAdminResources(params?: any) {

    return useQuery({

        queryKey: ["admin", "resources", params],

        queryFn: () => listResources(params),

    })

}