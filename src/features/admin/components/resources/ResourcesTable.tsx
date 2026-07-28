import { useState } from "react"

import { Card } from "@/components/ui/card"

import {

Table,

TableBody,

TableCell,

TableHead,

TableHeader,

TableRow,

} from "@/components/ui/table"

import { useAdminResources } from "@/features/admin/hooks/useAdminResources"

import { Pagination } from "@/components/common/Pagination"

import { LoadingState } from "@/features/admin/components/shared/LoadingState"

import { EmptyState } from "@/features/admin/components/shared/EmptyState"

export function ResourcesTable(){

const [page,setPage]=useState(1)

const {data,isLoading}=useAdminResources({

page,

})

if(isLoading){

return <LoadingState/>

}

if(!data?.items.length){

return <EmptyState/>

}

return(

<Card className="p-6">

<Table>

<TableHeader>

<TableRow>

<TableHead>Title</TableHead>

<TableHead>Kind</TableHead>

<TableHead>Author</TableHead>

<TableHead>Date</TableHead>

</TableRow>

</TableHeader>

<TableBody>

{

data.items.map(resource=>(

<TableRow key={resource.id}>

<TableCell>{resource.title}</TableCell>

<TableCell>{resource.kind}</TableCell>

<TableCell>{resource.author_name}</TableCell>

<TableCell>{resource.created_at}</TableCell>

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