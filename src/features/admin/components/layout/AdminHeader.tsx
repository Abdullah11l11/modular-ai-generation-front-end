import {

Shield,

} from "lucide-react"

export function AdminHeader() {

    return (

        <header className="flex h-16 items-center justify-between border-b px-6">

            <div>

                <h1 className="text-2xl font-bold">

                    Administration

                </h1>

                <p className="text-muted-foreground">

                    Manage users, templates and resources.

                </p>

            </div>

            <Shield className="text-cyan-500"/>

        </header>

    )

}