import { Navigate } from "react-router-dom"

import { useMe } from "@/features/me/hooks/useMe"

interface Props{

children:React.ReactNode

}

export function AdminGuard({

children,

}:Props){

const{

data:user,

isLoading,

}=useMe()

if(isLoading){

return null

}

if(!user){

return <Navigate to="/login" replace/>

}

if(user.role!=="admin"){

return <Navigate to="/"/>

}

return children

}
// import type { ReactNode } from "react";

// interface Props {
//   children: ReactNode;
// }

// export function AdminGuard({ children }: Props) {
//   return <>{children}</>;
// }