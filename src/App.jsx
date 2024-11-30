import React, { useRef, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import JsSIP from "jssip";
import loginSlice from "./redux/loginSlice";
import { setRegisterStatus, registerMakeCall } from "./redux/jsSIPSlice";

import useAxios from "./CustomHooks/useAxios";
import Login from "./page/login";
import Home from "./page/home";
import WindowCallOut from "./component/WindowCallOut";

function App() {
  const [isCallingOut, setIsCallingOut] = useState(false);
  let audioPlayers = useSelector((state) => state.jsSIPReducer.audioPlayers);
  let isLogined = useSelector((state) => state.loginReducer.isLogined);
  const endpointid = useSelector((state) => state.loginReducer.endpointid);
  const user = useSelector((state) => state.loginReducer.user);
  let webrtc = useSelector((state) => state.loginReducer.webrtc);

  const userRef = useRef(user);
  const sessionRef = useRef(null);
  const dispatch = useDispatch();
  const { axiosi } = useAxios();
  const coolPhone = useRef(
    useSelector((state) => state.jsSIPReducer.coolPhone)
  );

  ///////////////
  async function getUser() {
    const kq = await axiosi.post(`${process.env.DOMAIN}/users/getUser`);
    dispatch(loginSlice.actions.setUser({ user: kq.data }));
    userRef.current = kq.data;
  }

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (
      isLogined &&
      !(
        typeof user === "object" &&
        user !== null &&
        user.hasOwnProperty("agents")
      )
    ) {
      getUser();
    }
  }, []);

  //////////////
  //////////////
  function adjustSDP(sdp) {
    // Split SDP into lines for processing
    const lines = sdp.split("\r\n");
    const preferredCodecs = ["8", "0"]; // G711A (8) ưu tiên trước, G711U (0) sau
    const audioLinePrefix = "m=audio";
    let modified = false;

    const newSDPLines = lines.map((line) => {
      if (line.startsWith(audioLinePrefix)) {
        // Extract current codecs from the m=audio line
        const parts = line.split(" ");
        const mediaType = parts[0];
        const port = parts[1];
        const protocol = parts[2];
        const codecs = parts.slice(3);

        // Reorder codecs based on preference
        const reorderedCodecs = [
          ...preferredCodecs.filter((codec) => codecs.includes(codec)),
          ...codecs.filter((codec) => !preferredCodecs.includes(codec)),
        ];

        // Reconstruct the m=audio line
        const newLine = `${mediaType} ${port} ${protocol} ${reorderedCodecs.join(
          " "
        )}`;
        modified = true;
        return newLine;
      }
      return line; // Keep all other lines unchanged
    });

    // If no m=audio line is found, return original SDP
    if (!modified) {
      return sdp;
    }

    // Join lines back into a single SDP string
    return newSDPLines.join("\r\n");
  }
  const handleRegister = useCallback(async () => {
    if (coolPhone.current) {
      coolPhone.current.stop();
    }
    console.log("[handleRegister]", user);
    const getEndpoint = await axiosi.post("users/getEndpoint");
    console.log({ getEndpoint });
    console.log("[handleRegister] : endpointid=", endpointid);
    var socket = new JsSIP.WebSocketInterface(
      `wss://${process.env.SIP_DOMAIN}/ws`
    );

    var configuration = {
      sockets: [socket],
      uri: `sip:${endpointid}@${process.env.SIP_DOMAIN}`,
      password: getEndpoint.data[0].password,
    };
    console.log("[handleRegister] : configuration=", configuration);
    coolPhone.current = new JsSIP.UA(configuration);

    coolPhone.current.start();
    dispatch(registerMakeCall(jssipCall));
    
    coolPhone.current.on("registered", (eventData) => {
      console.info("coolPhone Registered, eventData=", eventData);
      dispatch(setRegisterStatus({ isRegister: true }));
    });
    coolPhone.current.on("unregistered", (eventData) => {
      console.info("coolPhone unRegistered, eventData=", eventData);
      dispatch(setRegisterStatus({ isRegister: false }));
    });
    coolPhone.current.on("registrationFailed", function (eventData) {
      console.log("registrationFailed", eventData);
      saveDebugLog({
        type: "registrationFailed",
        cause: eventData?.cause,
      });
    });
    coolPhone.current.on("newRTCSession", (eventData) => {
      console.info("coolPhone newRTCSession, eventData=", eventData);

      let originator = eventData.originator;
      let session = eventData.session;
      let request = eventData.request;
      console.log("[newRTCSession] : request=", request);

      //edit sdp
      session.on("sdp", function (sepEvent_data) {
        let sdp = sepEvent_data.sdp;
        try {
          sdp = adjustSDP(sdp);
        } catch (error) {
          console.error("Error adjusting SDP:", error);
        }
        if (session.myIsHold) {
          session.myIsHold = false;
          sdp += "a=inactive";
          sdp += "\r\n";
          console.log("[sdp]: ", sdp);
          sepEvent_data.sdp = sdp;
        } else {
          session.myUnHold = false;
          sdp += "a=sendrecv";
          sdp += "\r\n";
          console.log("[sdp]: ", sdp);
          sepEvent_data.sdp = sdp;
        }
      });

      if (originator === "remote") {
        // call in
      } else {
        //call out
        let telsdt = request.ruri._user;
        session.connection.addEventListener("addstream", function (e1) {
          // Or addtrack
          console.log("[peerSession-addstream]:session e1", e1);
          let stream = e1.stream;
          // debugger;
          var remoteAudio = window.document.createElement("audio");
          window.document.body.appendChild(remoteAudio);
          remoteAudio.srcObject = stream;
          remoteAudio.play();
          session.callstatus = "addstream";
        });
        session.on("progress", (data) => {
          console.log("[call out - progress].on = progress]:data=", data);
        });
        session.on("confirmed", (data) => {
          console.log("[call out - confirmed].on = confirmed]:data=", data);
        });
      }
    });
  });
  async function saveDebugLog(data = {}) {
    try {
      console.log("saveDebugLog, enableDebug =", enableDebugRef.current);
      console.log("saveDebugLog, userRef =", userRef.current);
      console.log(userRef.current?.agents);
      if (!userRef.current?.agents) {
        return;
      }
      console.log("saveDebugLog : Herer");
      let enable_debug = userRef.current?.agents[0]?.enable_debug;
      console.log("enable_debug=", enable_debug);
      if (enable_debug === 1) {
        const kq = await axiosi.put(`debuglog/saveLog`, data);
      }
    } catch (error) {
      console.log("Loi saveDebugLog :error=", error.message);
    }
  }
  const jssipCall = useCallback(
    (to, isForTransfer = false) => {
      to = to.trim();

      // if (Object.keys(mysessionsInfo.current).length > 0) {
      //   return;
      // }

      if (to.length === 0) {
        return;
      }

      saveDebugLog({
        type: "call",
        message: `Call to ${to}`,
        data: { to },
      });

      let nat_traversal = userRef.current?.agents[0]?.nat_traversal;
      nat_traversal = nat_traversal.replace(/\s+/g, " ");

      let pcConfig = JSON.parse(nat_traversal);

      saveDebugLog({
        pcConfig,
      });

      var eventHandlers = {
        peerconnection: function (callEventData) {
          console.log("makeCall peerconnection", callEventData);
          saveDebugLog({
            call_status: "makeCall peerconnection",
            data: callEventData,
          });
        },
        connecting: function (callEventData) {
          console.log("makeCall connecting", callEventData);
          saveDebugLog({
            call_status: "makeCall connecting",
            data: callEventData,
          });
          setIsCallingOut(true);
        },
        sending: function (callEventData) {
          console.log("makeCall sending", callEventData);
          saveDebugLog({
            call_status: "makeCall sending",
            data: callEventData,
          });
        },
        icecandidate: function (callEventData) {
          console.log(callEventData?.candidate?.candidate);
          saveDebugLog({
            call_status: "makeCall icecandidate",
            data: callEventData?.candidate?.candidate,
          });
        },
        getusermediafailed: function (callEventData) {
          console.log("makeCall getusermediafailed :" + callEventData);
          saveDebugLog({
            call_status: "makeCall getusermediafailed",
            data: callEventData,
          });
        },
        progress: function (e) {
          console.log("[eventHandlers]:call is in progress", this.id, e);
          saveDebugLog({
            call_status: "call is in progress",
            data: e,
          });
        },
        failed: function (e) {
          sessionRef.current = null;
          setIsCallingOut(false);
          saveDebugLog({
            call_status: "makeCall failed",
            data: e,
          });

          if (e.originator === "remote") {
            audioPlayers.End.play();
            setTimeout(() => {
              audioPlayers.End.pause();
            }, 1500);
          }
        },
        ended: function (e) {
          sessionRef.current = null;
          setIsCallingOut(false);
          console.log("[eventHandlers]:call ended with cause: ", e, this.id);

          if (e.originator === "remote") {
            audioPlayers.End.play();
            setTimeout(() => {
              audioPlayers.End.pause();
            }, 1500);
          }
          saveDebugLog({
            call_status: "makeCall ended",
            data: e,
          });
        },
        accepted: function (callEventData) {
          console.log("Call accepted");
          saveDebugLog({
            call_status: "makeCall accepted",
            data: callEventData,
          });
        },
        confirmed: function (e) {
          console.log("[eventHandlers]:call confirmed", this.id, e);

          saveDebugLog({
            call_status: "makeCall confirmed",
            data: e,
          });
        },
      };

      var options = {
        eventHandlers: eventHandlers,
        mediaConstraints: { audio: true, video: false },
      };

      if (
        typeof pcConfig === "object" &&
        pcConfig.hasOwnProperty("iceServers")
      ) {
        // Kiểm tra xem iceServers có phải là một mảng và có ít nhất một phần tử hay không.
        if (
          Array.isArray(pcConfig.iceServers) &&
          pcConfig.iceServers.length > 0
        ) {
          options.pcConfig = pcConfig;
        }
      }
      if (isForTransfer) {
        return coolPhone.current.call(
          `sip:${to}@${process.env.REACT_APP_DOMAIN_NAME}`,
          options
        );
      } else {
        sessionRef.current = coolPhone.current.call(
          `sip:${to}@${process.env.REACT_APP_DOMAIN_NAME}`,
          options
        );
        return sessionRef.current;
      }
    },
    [coolPhone.current]
  );

  const handleUnregister = () => {
    if (coolPhone.current) {
      coolPhone.current.unregister({ all: true });
      coolPhone.current.stop();
    }
  };
  useEffect(() => {
    let endpointid = "";
    let webrtc = "";
    if (
      isLogined &&
      typeof user === "object" &&
      user !== null &&
      user.hasOwnProperty("agents")
    ) {
      endpointid = user.agents[0].endpoint_id;
      webrtc = user.agents[0].webrtc;
    }
    if (isLogined && endpointid !== "" && webrtc === "yes") {
      console.log("[---------useEffect-----------]:will Register");
      handleRegister();
    } else {
      console.log("[---------useEffect-----------]:WILL unRegister");
      console.log({ isLogined, endpointid, webrtc });
      handleUnregister();
    }
  }, [user]);
  useEffect(() => {
    if (!isLogined) {
      handleUnregister();
    }
  }, [isLogined]);
  /////////////
  function hangup() {
    console.log("sessionRef=", sessionRef.current);
    if (sessionRef.current) {
      sessionRef.current.terminate();
      console.log("will hangup");
    } else {
      console.log("no sessionRef");
    }
  }
  return (
    <>
      <h1>JsSIP by Locvv</h1>

      {isLogined ? <Home /> : <Login />}
      <hr></hr>
      <button onClick={() => console.log(userRef.current)}>UseRef</button>
      <button onClick={() => console.log(user)}>User</button>
      <button onClick={() => console.log(isLogined)}>isLogined</button>
      <button onClick={() => handleUnregister()}>Unregister</button>
      <button onClick={() => console.log({ isCallingOut })}>
        isCallingOut
      </button>
      {sessionRef.current && (
        <WindowCallOut session={sessionRef.current}></WindowCallOut>
      )}
      <hr />
      <button onClick={() => hangup()}>App_Hangup</button>
    </>
  );
}

export default App;
