import React,{useRef,useEffect} from 'react'
import { useSelector } from "react-redux";
import useLogin from "../../../src/CustomHooks/useLogin";
import RegisterStatus from './../../component/RegisterStatus';
import PhonePad from './../../component/PhonePad';
// import WindowCallOut from './../../component/WindowCallOut';
function Home() {
  const user = useSelector((state) => state.loginReducer.user);
  
  const { saveLoginStatus, removeLoginStatus } = useLogin();
  
  
  return (
    <>
    <div>Home</div>
    <RegisterStatus/>
    <PhonePad/>
    {/* <WindowCallOut/> */}
    <button onClick={()=>removeLoginStatus()}>Logout</button>
    <button onClick={()=>console.log(user)}>user</button>
    
    </>
  )
}

export default Home