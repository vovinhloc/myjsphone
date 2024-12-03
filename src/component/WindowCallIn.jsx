import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import WindowTransfer from "./WindowTransfer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const WindowCallIn = ({
  session,
  resetIncallSession,
  ringAudio_stop,
  endAudio_play,
}) => {
  const [counttime, setCounttime] = useState(0);
  const [countCalltime, setCountCalltime] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [mutedClass, setMutedClass] = useState("");
  const [onHoldClass , setOnHoldClass] = useState("");
  const [myCallStatus, setMyCallStatus] = useState("Ringing");
  const [hangupName, setHangupName] = useState("Reject");
  const [transferTo, setTransferTo] = useState("6311");
  const audioPlayers = useSelector((state) => state.jsSIPReducer.audioPlayers);
  const makeCall = useSelector((state) => state.jsSIPReducer.makeCall);
  const user = useSelector((state) => state.loginReducer.user);
  const sessionTransferTo = useRef(null);
  const answer = () => {
    setIsAnswered(true);
    ringAudio_stop();
    // audioPlayers.Ring.pause();
    session.answer({ mediaConstraints: { audio: true, video: false } });
    // session.connection.addEventListener("addstream", function (e1) {
    //   var remoteAudio = window.document.createElement("audio");
    //   window.document.body.appendChild(remoteAudio);
    //   remoteAudio.srcObject = e1.stream;
    //   remoteAudio.play();
    // });
    session.connection.addEventListener("track", function (e1) {
      console.log("[peerSession-ontrack]: session e1", e1);
      let stream = e1.streams[0];

      // Lấy thẻ audio có sẵn
      let remoteAudio = document.getElementById("remoteAudio");
      if (remoteAudio) {
        remoteAudio.srcObject = stream;
      } else {
        console.error("Audio element not found!");
      }

      session.callstatus = "ontrack";
    });
  };
  const hangup = () => {
    ringAudio_stop();
    // audioPlayers.Ring.pause();
    session.terminate();
  };
  const hold = () => {
    session.hold();
  };
  const unHold = () => {
    session.unhold();
  };
  const toggleMute = () => {
    console.log("session.isMuted()", session.isMuted());
    const {audio}=session.isMuted();
    if (audio) {
      session.unmute();
      setMutedClass("");
    } else {
      session.mute();
      setMutedClass("color-red");
    }
  }
  const toggleHold = () => {
    console.log("session.isOnHold()", session.isOnHold());
    const {local}=session.isOnHold();
    console.log("local Hold =",local);
    if (local) {
      session.unhold({
        extraHeaders: ["X-UnHold-Reason: User requested"],},()=>setOnHoldClass(""));
    } else {
      session.hold({
        extraHeaders: ["X-Hold-Reason: User requested"],},()=>setOnHoldClass("color-red"));
    }
  }
  const handleTransfer = () => {
    session.hold();
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
    } else return "";
  }
  useEffect(() => {
    if (session) {
      session.myIsHold1 = false;
      session.myIsMute=false;
      session.on("failed", (session_event_data) => {
        setIsAnswered(false);
        setMyCallStatus("failed");
        ringAudio_stop();
        // audioPlayers.Ring.pause();
        console.log("failed:session_event_data : ", "session_event_data");
        if (session_event_data.originator === "remote") {
          endAudio_play();
          // audioPlayers.End.play();
          // setTimeout(() => {
          //   audioPlayers.End.pause();
          // }, 1500);
        }
        resetIncallSession();
      });
      session.on("ended", (session_event_data) => {
        setIsAnswered(false);
        setMyCallStatus("ended");

        console.log("Session ended :", "session_event_data");
        if (session_event_data.originator === "remote") {
          endAudio_play();
          // audioPlayers.End.play();
          // setTimeout(() => {
          //   audioPlayers.End.pause();
          // }, 1500);
        }
        resetIncallSession();
      });
      session.on("progress", (session_event_data) => {
        setMyCallStatus("progress");
        console.log("Session progress :", "session_event_data");
      });
      session.on("confirmed", (session_event_data) => {
        setMyCallStatus("Answered");
        console.log("confirmed : ", "session_event_data");
      });
      session.on("accepted", (session_event_data) => {
        setMyCallStatus("accepted");
        console.log("accepted : ", "session_event_data");
      });
    }
  }, []);

  useEffect(() => {
    let timer;
    if (session) {
      if (myCallStatus == "Answered") {
        console.log({ myCallStatus, countCalltime });
        console.log("start Timer timer");
        timer = setInterval(() => {
          setCounttime((pre) => pre + 1);
        }, 1000);
      }
    }
    return () => {
      console.log("clear Timer timer");
      clearInterval(timer);
    };
  }, [myCallStatus]);

  useEffect(() => {
    let talkTimeTiner;
    talkTimeTiner = setInterval(() => {
      // console.log({myCallStatus, countCalltime,counttime});
      setCountCalltime((pre) => pre + 1);
    }, 1000);

    if (myCallStatus == "Answered") {
      clearInterval(talkTimeTiner);
    }

    return () => {
      console.log("----------Clear Progresss----------------");
      clearInterval(talkTimeTiner);
    };
  }, [myCallStatus]);

  return (
    <>
      <div className="WindowCallOut containerColumn">
        <div className="WindowCallOut-item WindowCallOut-item__header">
          <span className="fn">Incoming:</span>
          <span className="fv"> {session?.myCallFrom}</span>
        </div>
        <div className="WindowCallOut-item">
          <span className="fn">Call status:</span>
          <span className="fv">{myCallStatus} </span>
        </div>
        {/* <div className="WindowCallOut-item"><span className="fn">Call start:</span><span className="fv"> {session?.myCallStatus}</span></div>
        <div className="WindowCallOut-item"><span className="fn">Call progress:</span><span className="fv"> 0908407321</span></div>
        <div className="WindowCallOut-item"><span className="fn">Call connected:</span><span className="fv"> 0908407321</span></div> */}
        <div className="WindowCallOut-item">
          <span className="fn">Ringing duration:</span>
          <span className="fv"> {rdDuration(countCalltime)}</span>
        </div>
        <div className="WindowCallOut-item">
          <span className="fn">Talk duration:</span>
          <span className="fv"> {rdDuration(counttime)}</span>
        </div>

       {(!isAnswered)? (<div className="incomingCallBtnsContainer">
          <div className="incomingCallBtnsContainer_item containerColumn flexCenter" onClick={hangup}>
            
              <FontAwesomeIcon icon="fa-solid fa-phone" className="color-red" />
              <span>Reject</span>
            
          </div>
          <div className="incomingCallBtnsContainer_item containerColumn flexCenter" onClick={answer}>
            
              <FontAwesomeIcon
                icon="fa-solid fa-phone"
                className="color-blue"
              />
             <span>Answer</span>
            
          </div> 
        </div>) : (


        <div className="incomingCallBtnsContainer"  >
          <div className="incomingCallBtnsContainer_item containerColumn flexCenter" onClick={toggleMute}>
            <FontAwesomeIcon icon="fa-solid fa-microphone" className={mutedClass} />
            <span>Mute</span>
          </div>
          <div className="incomingCallBtnsContainer_item containerColumn flexCenter" onClick={toggleHold}>
            <FontAwesomeIcon icon="fa-solid fa-circle-play" className={onHoldClass} />
            <span>Hold</span>
          </div> 
          {/* <div className="incomingCallBtnsContainer_item containerColumn flexCenter" onClick={handleTransfer}>
            <FontAwesomeIcon icon="fa-solid fa-arrow-right-arrow-left" />
            <span>Transfer</span>
          </div> */}
          <div className="incomingCallBtnsContainer_item containerColumn flexCenter" onClick={hangup}>
            <FontAwesomeIcon icon="fa-solid fa-phone" className="color-red" />
            <span>Hangup</span>
          </div>
        </div> )}
      </div>
      {/* <h3>Window Incoming Call</h3>
      <div style={{padding:"10px",border:"1px solid red"}}>
      <button onClick={hangup}>Reject</button>
      <button onClick={answer}>Answer</button>
      <br/> */}
      {/* <button onClick={hangup}>Hangup</button>
        <button onClick={hold}>Hold</button>
        <button onClick={unHold}>unHold</button>
        <div>
            <input value={transferTo} onChange={(e)=>setTransferTo(e.target.value)} />
            <button onClick={()=>callForTransfer(transferTo,true)}>Call</button>
        </div>
        <div>
            <button onClick={()=>transferCallsWithReplaces(session,sessionTransferTo.current)}>Transfer</button>
        </div>
        <button onClick={()=>console.log("[show Transfer To session]:",sessionTransferTo.current)}>show Transfer To session</button> */}
      {/* </div> */}
      {/* <WindowTransfer session={session} />
      <hr/> */}
    </>
  );
};

export default WindowCallIn;
