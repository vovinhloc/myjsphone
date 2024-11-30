import React from 'react'
import { useSelector } from "react-redux";
function RegisterStatus() {
    const user = useSelector((state) => state.loginReducer.user);
    const isRegistered = useSelector((state) => state.jsSIPReducer.isRegister);
    console.info({isRegistered})
    // function rdRegisterStatus(){
    //     if (isRegistered && isRegistered===true){
    //         return ("Registered")
    //     } else
    //         return ("not registered")
    // }
  return (
    <div>{(isRegistered) ? ("Registered"): ("not registered")}</div>
  )
}

export default RegisterStatus