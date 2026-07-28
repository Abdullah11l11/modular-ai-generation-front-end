import { useQuery } from "@tanstack/react-query"

import { listUsers } from "../api/listAdminUsers"

export function useAdminUsers(params?: any) {

    return useQuery({

        queryKey: ["admin", "users", params],

        queryFn: () => listUsers(params),

    })

}
