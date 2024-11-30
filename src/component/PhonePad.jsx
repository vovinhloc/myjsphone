import React ,{useState} from 'react'
import { useSelector } from 'react-redux'
function PhonePad() {
  const [callTo,setCallTo]=useState('6310');
  const makeCall = useSelector(state => state.jsSIPReducer.makeCall);
  return (
    //create a phone pad
    <>
    <h3>PhonePad</h3>
    {/* // creat a phone pad layout */}
    <div>
      <input  value={callTo} onChange={(e)=>setCallTo(e.target.value)}/> 
      <button onClick={()=>makeCall(callTo)}>Call</button>
    </div>
    </>
  )
}

export default PhonePad