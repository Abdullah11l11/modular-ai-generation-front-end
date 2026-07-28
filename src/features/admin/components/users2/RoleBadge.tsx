import {

Badge,

} from "src/components/ui/badge"

import {

Shield,

User,

} from "lucide-react"

interface Props{

role:"user"|"admin"

}

export function RoleBadge({

role,

}:Props){

if(role==="admin"){

return(

<Badge>

<Shield className="mr-1 h-3 w-3"/>

Admin

</Badge>

)

}

return(

<Badge variant="secondary">

<User className="mr-1 h-3 w-3"/>

User

</Badge>

)

}