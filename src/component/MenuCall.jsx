import React,{useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const MenuCall = ({ session }) => {
  const [mutedClass, setMutedClass] = useState("");
  const [onHoldClass, setOnHoldClass] = useState("");
  const hangup = () => {
    session.terminate();
  };
  const toggleMute = () => {
    
    const { audio } = session.isMuted();
    if (audio) {
      session.unmute();
      setMutedClass("");
    } else {
      session.mute();
      setMutedClass("color-red");
    }
  };
  const toggleHold = () => {
    
    const { local } = session.isOnHold();
    console.log("local Hold =", local);
    if (local) {
      session.unhold(
        {
          extraHeaders: ["X-UnHold-Reason: User requested"],
        },
        () => setOnHoldClass("")
      );
    } else {
      session.hold(
        {
          extraHeaders: ["X-Hold-Reason: User requested"],
        },
        () => setOnHoldClass("color-red")
      );
    }
  };
  return (
    <div className="incomingCallBtnsContainer">
      <div
        className="incomingCallBtnsContainer_item containerColumn flexCenter"
        onClick={toggleMute}
      >
        <FontAwesomeIcon icon="fa-solid fa-microphone" className={mutedClass} />
        <span>Mute</span>
      </div>
      <div
        className="incomingCallBtnsContainer_item containerColumn flexCenter"
        onClick={toggleHold}
      >
        <FontAwesomeIcon
          icon="fa-solid fa-circle-play"
          className={onHoldClass}
        />
        <span>Hold</span>
      </div>
      {/* <div className="incomingCallBtnsContainer_item containerColumn flexCenter" onClick={handleTransfer}>
            <FontAwesomeIcon icon="fa-solid fa-arrow-right-arrow-left" />
            <span>Transfer</span>
          </div> */}
      <div
        className="incomingCallBtnsContainer_item containerColumn flexCenter"
        onClick={hangup}
      >
        <FontAwesomeIcon icon="fa-solid fa-phone" className="color-red" />
        <span>Hangup</span>
      </div>
    </div>
  );
};

export default MenuCall;
