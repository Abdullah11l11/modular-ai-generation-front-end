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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
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
// import { Navigate, Outlet } from 'react-router-dom';
// import { useMe } from '@/features/me/hooks/useMe';
// export function AdminGuard() {
//   const {
//     data: user,
//     isLoading,
//     isError,
//   } = useMe();

//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         Loading...
//       </div>
//     );
//   }

//   if (!user || isError) {
//     return <Navigate to="/login" replace />;
//   }

//   if (user.role !== 'admin') {
//     return <Navigate to="/admin" replace />;
//   }

//   return <Outlet />;
// }