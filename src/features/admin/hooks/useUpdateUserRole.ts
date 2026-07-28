import { useMutation } from "@tanstack/react-query"

import { useQueryClient } from "@tanstack/react-query"

import { updateUserRole } from "../api/updateUserRole"

import type {
    UpdateUserRoleRequest,
} from "@/features/admin/types/updateRoleRequest"

interface Variables {

    id: number

    body: UpdateUserRoleRequest

}

export function useUpdateUserRole() {

    const queryClient = useQueryClient()

    return useMutation({

        mutationFn: ({ id, body }: Variables) =>

            updateUserRole(id, body),

        onSuccess() {

            queryClient.invalidateQueries({

                queryKey: ["admin", "users"],

            })

        },

    })

}