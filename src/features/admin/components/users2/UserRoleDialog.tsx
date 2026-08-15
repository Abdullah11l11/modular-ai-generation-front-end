import { useEffect, useState } from "react"

import {
    AlertTriangle,
} from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import {
    Button,
} from "@/components/ui/button"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert"

import {
    useUpdateUserRole,
} from "@/features/admin/hooks/useUpdateUserRole"

import type {
    AdminUser,
} from "@/features/admin/types/adminUser"

interface Props {

    open: boolean

    user: AdminUser

    onClose: () => void

}

export function UserRoleDialog({

    open,

    user,

    onClose,

}: Props) {

    const [role, setRole] = useState(user.role)

    const mutation = useUpdateUserRole()

    useEffect(() => {

        setRole(user.role)

    }, [user])

    async function handleSave() {

        await mutation.mutateAsync({

            id: user.id,

            body: {

                role,

            },

        })

        onClose()

    }

    return (

        <Dialog

            open={open}

            onOpenChange={onClose}

        >

            <DialogContent className="sm:max-w-md">

                <DialogHeader>

                    <DialogTitle>

                        Change User Role

                    </DialogTitle>

                    <DialogDescription>

                        Update the permission level for this user.

                    </DialogDescription>

                </DialogHeader>

                <div className="space-y-5">

                    <Alert>

                        <AlertTriangle
                            className="h-4 w-4"
                        />

                        <AlertDescription>

                            This action immediately changes the
                            user's permissions.

                        </AlertDescription>

                    </Alert>

                    <div>

                        <div className="mb-2 text-sm font-medium">

                            User

                        </div>

                        <div className="rounded-md border p-3">

                            {user.name}

                            <div className="text-sm text-muted-foreground">

                                {user.email}

                            </div>

                        </div>

                    </div>

                    <div>

                        <div className="mb-2 text-sm font-medium">

                            Role

                        </div>

                        <Select

                            value={role}

                            onValueChange={(value) =>
                                setRole(value as "user" | "admin")
                            }

                        >

                            <SelectTrigger>

                                <SelectValue />

                            </SelectTrigger>

                            <SelectContent>

                                <SelectItem value="user">

                                    User

                                </SelectItem>

                                <SelectItem value="admin">

                                    Admin

                                </SelectItem>

                            </SelectContent>

                        </Select>

                    </div>

                </div>

                <DialogFooter>

                    <Button

                        variant="outline"

                        onClick={onClose}

                    >

                        Cancel

                    </Button>

                    <Button

                        onClick={handleSave}

                        disabled={
                            mutation.isPending ||
                            role === user.role
                        }

                    >

                        {

                            mutation.isPending

                                ? "Saving..."

                                : "Save Changes"

                        }

                    </Button>

                </DialogFooter>

            </DialogContent>

        </Dialog>

    )

}