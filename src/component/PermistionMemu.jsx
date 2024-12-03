import React, { useState } from "react";
import useLogin from "../CustomHooks/useLogin";
const PermistionMemu = () => {
  const { saveLoginStatus, removeLoginStatus } = useLogin();
  const [speakers, setSpeakers] = useState([]);
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.error("This browser does not support notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted");
      const tb = new Notification("Notification is allowed");
      tb.onclick = (event) => {
        console.log("click3");

        if (window.focus) {
          window.focus();
        }
      };
    } else {
      console.error("Notification permission denied");
      alert("Notification permission denied");
    }
  };
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone permission granted");
      alert("Microphone is allowed!");
    } catch (error) {
      console.error("Microphone permission denied", error);
      alert("Microphone permission denied");
    }
  };
  const showSpeaker = async () => {
    console.log({ speakers });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone permission granted");
      alert("Microphone is allowed!");
    } catch (error) {
      console.error("Microphone permission denied", error);
      alert("Microphone permission denied");
    }
  };
  const doShowSpeaker = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(() => {
        return navigator.mediaDevices.enumerateDevices();
      })
      .then((devices) => {
        let mics = [];
        let currentSpeakers = [];
        let cameras = [];
        for (let i = 0; i < devices.length; i++) {
          const device = devices[i];
          if (device.kind === "audioinput") {
            mics.push(device);
          }
          if (device.kind === "audiooutput") {
            currentSpeakers.push(device);
          }
          if (device.kind === "videoinput") {
            cameras.push(device);
          }
        }
        setSpeakers(currentSpeakers);
        console.log({ currentSpeakers });
        // devices.forEach((device) => {
        //   console.log(
        //     `${device.kind}: ${device.label} (id: ${device.deviceId})`
        //   );
        //   if (device.kind === "audioinput") {
        //     mics.push(device);
        //   }
        //   if (device.kind === "audiooutput") {
        //     setSpeakers((prevSpeakers) => [...prevSpeakers, device]);
        //     // speakers.push(device);
        //   }
        //   if (device.kind === "videoinput") {
        //     cameras.push(device);
        //   }
        //   console.log({ speakers });
        //   // let div = document.createElement("div");
        //   // div.innerText = `${device.kind}: ${device.label} (id: ${device.deviceId})`;
        //   // document.getElementById("devicesInfo").appendChild(div);
        // });
      })
      .catch((error) => {
        console.error("Error accessing devices or permissions denied:", error);
      });
  };
  return (
    <>
      <h3>Setting Menu</h3>
      <div className="container">
        {/* <div className="row" onClick={requestNotificationPermission}>
            <button>Notification</button>            
        </div> */}
        <div className="row" onClick={requestMicrophonePermission}>
          <button>Micro</button>
        </div>
        {/* <div className="row" onClick={doShowSpeaker}>
          <button>Show Speaker</button>
        </div> */}
        <div className="row" onClick={removeLoginStatus}>
          <button>Logout</button>
        </div>
        {/* {speakers.map((speaker) => (
          <div key={speaker.deviceId}>
            <p>{speaker.label}</p>
          </div>
        ))}
        <select>
          {speakers.map((speaker) => (
            <option key={speaker.deviceId}>{speaker.label}</option>
          ))}
        </select> */}
      </div>
    </>
  );
};

export default PermistionMemu;
