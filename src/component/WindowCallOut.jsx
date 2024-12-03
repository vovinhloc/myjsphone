// import { func } from "prop-types";
import React, { useState, useRef , useEffect} from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MenuCall from "./MenuCall";
function WindowCallOut({ session,callOutStatus }) {
  const [transferTo, setTransferTo] = useState("6311");
  const [hangupName,setHangupName]=useState("Cancel");
  const [counttime, setCounttime] = useState(0);
  const [countCalltime, setCountCalltime] = useState(0);
  const makeCall = useSelector((state) => state.jsSIPReducer.makeCall);
  const user = useSelector((state) => state.loginReducer.user);
  const sessionTransferTo = useRef(null);
  const hangup = () => {
    session.terminate();
  };
  const hold = () => {
    session.hold();
  };
  const unHold = () => {
    session.unhold();
  };
  function callForTransfer() {
    sessionTransferTo.current = makeCall(transferTo, true);
    console.info(
      "============================CallForTransfer========================="
    );
    console.log(
      "[callForTransfer]: sessionTransferTo.current=",
      sessionTransferTo.current
    );
  }
  function transferCallsWithReplaces(session1, session2) {
    try {
      if (session1.isEstablished() && session2.isEstablished()) {
        let SIP_USER = user?.agents[0]?.endpoint_id;
        let server = process.env.SIP_DOMAIN;
        const session2CallId = session2._request.call_id;
        const session2FromTag = session2._from_tag;
        const session2ToTag = session2._to_tag;

        const replacesHeader = `${session2CallId};to-tag=${session2ToTag};from-tag=${session2FromTag}`;

        const targetUri = session2.remote_identity.uri.clone();
        targetUri.setHeader("Replaces", encodeURIComponent(replacesHeader));

        const referEventHanlers = {
          requestSucceeded: (referEvent_data) => {
            console.log("referEvent_data,requestSucceeded:", referEvent_data);
          },
          requestFailed: (referEvent_data) => {
            console.log("referEvent_data,requestFailed:", referEvent_data);
          },
          trying: (referEvent_data) => {
            console.log("referEvent_data,trying:", referEvent_data);
          },
          progress: (referEvent_data) => {
            console.log("referEvent_data,progress:", referEvent_data);
          },
          accepted: (referEvent_data) => {
            console.log("referEvent_data,accepted:", referEvent_data);
            session1.terminate();
          },
          failed: (referEvent_data) => {
            console.log("referEvent_data, failed:", referEvent_data);
          },
        };
        // Thực hiện REFER request với URI object
        session1.refer(targetUri, {
          extraHeaders: [`Referred-By: <sip:${SIP_USER}@${server}>`],
          eventHandlers: referEventHanlers,
        });
      } else {
        throw new Error("One or both sessions are not established");
      }
    } catch (error) {
      console.error("Error during transfer:", error);
      throw error;
    }
  }
  function rdDuration(d) {
    if (d > 0) {
      const idtime = new Date(d * 1000).toISOString().substr(11, 8);
      return "" + idtime;
    } else return ""
    // else {
    //   return "Call status: " + callStatus;
    // }
  }
  useEffect(() => {
    let talkTimeTiner;
    if(session){
      if(session.myCallStatus=="confirmed"){
        
        talkTimeTiner=setInterval(() => {
          setCounttime((pre) => pre + 1);
        }, 1000);
      }
    }
    return () => {
      clearInterval(talkTimeTiner);
    };
  },[session?.myCallStatus])
  useEffect(() => {
    let talkTimeTiner;
    console.log("----------Progresss----------------");
    if(session){
      if(session.myCallStatus=="progress"){
        console.log("----------Progresss----------------");
        talkTimeTiner=setInterval(() => {
          setCountCalltime((pre) => pre + 1);
        }, 1000);
      }
    }
    return () => {
      console.log("----------Clear Progresss----------------");
      clearInterval(talkTimeTiner);
    };
  },[session?.myCallStatus])
  return (
    <>
      <div className="WindowCallOut containerColumn">
        <div className="WindowCallOut-item WindowCallOut-item__header"><span className="fn">CallOut:</span><span className="fv"> {session?.myCallTo}</span></div>
        <div className="WindowCallOut-item"><span className="fn">Call status:</span><span className="fv">{callOutStatus} </span></div>
        {/* <div className="WindowCallOut-item"><span className="fn">Call start:</span><span className="fv"> {session?.myCallStatus}</span></div>
        <div className="WindowCallOut-item"><span className="fn">Call progress:</span><span className="fv"> 0908407321</span></div>
        <div className="WindowCallOut-item"><span className="fn">Call connected:</span><span className="fv"> 0908407321</span></div> */}
        <div className="WindowCallOut-item"><span className="fn">Connect duration:</span><span className="fv"> {rdDuration(countCalltime)}</span></div>
        <div className="WindowCallOut-item"><span className="fn">Talk duration:</span><span className="fv"> {rdDuration(counttime)}</span></div>
        
        {(session?.myHangupName==="Cancel")?(<div className="hangupButton"><button onClick={hangup}><FontAwesomeIcon icon="fa-solid fa-phone" className="color-red" />Cancel</button></div>):(
          <MenuCall session={session} />
        )}

        
        <div className="hidden">
          <button onClick={hangup}>{hangupName}</button>
          <button onClick={hold}>Hold</button>
          <button onClick={unHold}>unHold</button>
          <div>
            <input
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
            />
            <button onClick={() => callForTransfer(transferTo, true)}>
              Call
            </button>
          </div>
          <div>
            <button
              onClick={() =>
                transferCallsWithReplaces(session, sessionTransferTo.current)
              }
            >
              Transfer
            </button>
          </div>
          <button
            onClick={() =>
              console.log(
                "[show Transfer To session]:",
                sessionTransferTo.current
              )
            }
          >
            show Transfer To session
          </button>
        </div>
      </div>
      {/* <hr /> */}
    </>
  );
}

export default WindowCallOut;
