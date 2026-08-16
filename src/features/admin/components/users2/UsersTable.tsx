import { useMemo, useState } from "react"

import {
    Search,
    Shield,
    User,
} from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Input,
} from "@/components/ui/input"

import {
    Button,
} from "@/components/ui/button"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Badge,
} from "@/components/ui/badge"

import {
    useAdminUsers,
} from "@/features/admin/hooks/useAdminUsers"

import type { User as AdminUser } from "@/types/api"

import { LoadingState } from "@/features/admin/components/shared/LoadingState"

import { EmptyState } from "@/features/admin/components/shared/EmptyState"

import { UserRoleDialog } from "./UserRoleDialog"

export function UsersTable() {

    const [page] = useState(1)

    const [search, setSearch] = useState("")

    const [selectedUser, setSelectedUser] = useState<AdminUser>()

    const {
        data,
        isLoading,
    } = useAdminUsers({
        page,
        q: search,
    })

    const users = useMemo(() => data?.data ?? [], [data])

    if (isLoading) {

        return <LoadingState />

    }

    if (users.length === 0) {

        return <EmptyState />

    }

    return (

        <Card>

            <CardHeader className="flex flex-row items-center justify-between">

                <CardTitle>

                    Users

                </CardTitle>

                <div className="relative w-72">

                    <Search

                        size={15}

                        className="absolute left-3 top-3 text-muted-foreground"

                    />

                    <Input

                        value={search}

                        onChange={(e) =>

                            setSearch(e.target.value)

                        }

                        placeholder="Search user..."

                        className="pl-9"

                    />

                </div>

            </CardHeader>

            <CardContent>

                <Table>

                    <TableHeader>

                        <TableRow>

                            <TableHead>

                                Name

                            </TableHead>

                            <TableHead>

                                Email

                            </TableHead>

                            <TableHead>

                                Role

                            </TableHead>

                            <TableHead>

                                Joined

                            </TableHead>

                            <TableHead className="w-32"/>

                        </TableRow>

                    </TableHeader>

                    <TableBody>

                        {

                            users.map((user) => (

                                <TableRow key={user.id}>

                                    <TableCell>

                                        <div className="flex items-center gap-2">

                                            <User size={16}/>

                                            {user.name}

                                        </div>

                                    </TableCell>

                                    <TableCell>

                                        {user.email}

                                    </TableCell>

                                    <TableCell>

                                        {

                                            user.role === "admin"

                                                ? (

                                                    <Badge>

                                                        <Shield className="mr-1 h-3 w-3"/>

                                                        Admin

                                                    </Badge>

                                                )

                                                : (

                                                    <Badge variant="secondary">

                                                        User

                                                    </Badge>

                                                )

                                        }

                                    </TableCell>

                                    <TableCell>

                                        {

                                            new Date(

                                                user.created_at,

                                            ).toLocaleDateString()

                                        }

                                    </TableCell>

                                    <TableCell>

                                        <Button

                                            size="sm"

                                            onClick={() =>

                                                setSelectedUser(user)

                                            }

                                        >

                                            Edit

                                        </Button>

                                    </TableCell>

                                </TableRow>

                            ))

                        }

                    </TableBody>

                </Table>

            </CardContent>

            {

                selectedUser && (

                    <UserRoleDialog

                        key={selectedUser.id}

                        user={selectedUser}

                        open={!!selectedUser}

                        onClose={() =>

                            setSelectedUser(undefined)

                        }

                    />

                )

            }

        </Card>

    )

}
