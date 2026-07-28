import { useState } from "react"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

import { Card } from "@/components/ui/card"

import {

Table,

TableBody,

TableCell,

TableHead,

TableHeader,

TableRow,

} from "@/components/ui/table"

import { useAdminTemplates } from "@/features/admin/hooks/useAdminTemplates"
import { LoadingState } from "@/features/admin/components/shared/LoadingState"

import { EmptyState } from "@/features/admin/components/shared/EmptyState"

import { Pagination } from "@/components/common/Pagination"

export function TemplatesTable() {

    const [page, setPage] = useState(1)

    const [search, setSearch] = useState("")

    const {

        data,

        isLoading,

    } = useAdminTemplates({

        page,

        q: search,

    })

    if (isLoading) {

        return <LoadingState />

    }

    if (!data?.items.length) {

        return <EmptyState />

    }

    return (

        <Card className="p-6 space-y-5">

            <div className="relative">

                <Search className="absolute left-3 top-3 h-4 w-4"/>

                <Input

                    placeholder="Search template..."

                    value={search}

                    onChange={(e)=>setSearch(e.target.value)}

                    className="pl-10"

                />

            </div>

            <Table>

                <TableHeader>

                    <TableRow>

                        <TableHead>Title</TableHead>

                        <TableHead>Author</TableHead>

                        <TableHead>Type</TableHead>

                        <TableHead>Visibility</TableHead>

                        <TableHead>Upvotes</TableHead>

                    </TableRow>

                </TableHeader>

                <TableBody>

                    {

                        data.items.map(template=>(

                            <TableRow key={template.id}>

                                <TableCell>

                                    {template.title}

                                </TableCell>

                                <TableCell>

                                    {template.author_name}

                                </TableCell>

                                <TableCell>

                                    {template.type}

                                </TableCell>

                                <TableCell>

                                    {template.visibility}

                                </TableCell>

                                <TableCell>

                                    {template.upvotes}

                                </TableCell>

                            </TableRow>

                        ))

                    }

                </TableBody>

            </Table>

            <Pagination

                page={page}

                totalPages={data.meta.last_page}

                onChange={setPage}

            />

        </Card>

    )

}