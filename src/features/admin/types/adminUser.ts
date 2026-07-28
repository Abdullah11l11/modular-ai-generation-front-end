export interface AdminUser {
    id: number

    name: string

    email: string

    role: "user" | "admin"

    avatar_url?: string

    created_at: string

    updated_at: string
}