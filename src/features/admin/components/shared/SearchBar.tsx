import { Search } from "lucide-react";

import {

Input

} from "@/components/ui/input";

interface Props{

value:string;

onChange(value:string):void;

}

export function SearchBar({

value,

onChange

}:Props){

return(

<div className="relative w-80">

<Search
className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
/>

<Input

placeholder="Search..."

value={value}

onChange={(e)=>onChange(e.target.value)}

className="pl-9"

/>

</div>

)

}