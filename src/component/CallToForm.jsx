import React,{useState} from "react";
import { useSelector } from 'react-redux'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NumberPad from "./NumberPad";

const CallToForm = () => {
    const [callto,setCallto] = useState("");
    const makeCall = useSelector(state => state.jsSIPReducer.makeCall);
  function handleOnSubmit(e) {
    e.preventDefault();
    console.log(e);
    makeCall(callto);
  }
  function handleNumberPadClick(e,key) {
    e.preventDefault();
    console.log(key);
    if (key!="x"){
        setCallto(callto+key);
    }else {
        setCallto((prev)=>{
            return prev.slice(0,-1);
        });
    }
    
  }
  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <div className="call-to-form">
          <input value={callto} name="calto" type="text" placeholder="Call to" onChange={(e) => setCallto(e.target.value)} />
          <button type="submit">
            <FontAwesomeIcon icon="fa-solid fa-phone" className="color-blue" />
          </button>
        </div>
         <NumberPad handleNumberPadClick={handleNumberPadClick} />
        <div className="callButtonContainer">
          <button type="submit">
            <FontAwesomeIcon icon="fa-solid fa-phone" className="color-blue" />
          </button>
        </div>
      </form>
    </>
  );
};

export default CallToForm;
