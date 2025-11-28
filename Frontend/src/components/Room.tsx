import { useSearchParams } from "react-router-dom"
import { useEffect } from "react";
export const Room =()=>{

    const [searchPArams,setSearchParams] = useSearchParams()
   
   const name = searchPArams.get('name');
   
   
  //here we make the connection to server
    //maintain that connection always
    //maintain that connection always & shuffle them in participantes
   useEffect(()=>{
  
   },[name])
   
   return <div>
    hi {name}
    </div>
}