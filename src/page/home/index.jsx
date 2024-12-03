import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

import useLogin from "../../../src/CustomHooks/useLogin";
import RegisterStatus from "./../../component/RegisterStatus";
import PhonePad from "./../../component/PhonePad";
import CallToForm from "./../../component/CallToForm";
import PermistionMemu from "./../../component/PermistionMemu";
// import WindowCallOut from './../../component/WindowCallOut';
function Home({isOnCall}) {
  const user = useSelector((state) => state.loginReducer.user);
  const [curIP, setCurIP] = useState("");
  const [showSettingMenu, setShowSettingMenu] = useState(false);
  const [displayRegisterStatus, setDisplayRegisterStatus] = useState("");
  const [userAvatar, setUserAvatar] = useState("userRegistered");
  const [pauseStatus, setPauseStatus] = useState(false);
  const [supporWorker, setSupporWorker] = useState("support worker");
  const { saveLoginStatus, removeLoginStatus } = useLogin();
  let isRegister = useSelector((state) => state.jsSIPReducer.isRegister);
  const displayExt = (endpointid) => {
    if (!endpointid) {
      return "";
    }
    const ext = endpointid.split("_");
    return ext[0];
  };
  const handleShowSettingMenu = () => {
    setShowSettingMenu(!showSettingMenu);
  };
  useEffect(() => {
    function getIP() {
      fetch(`${process.env.DOMAIN}/ip`)
        .then((response) => {
          // console.log("response=", response);
          return response.json();
        })
        .then((data) => setCurIP(data.ip));
    }
    getIP();
    let timer = setInterval(getIP, 10000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    // handleFaviIcon("faviconGreenUser.ico");
    if (!isRegister) {
      setDisplayRegisterStatus(" is not Registered");
      setUserAvatar("userUnRegistered");
      // handleFaviIcon("faviconBlackUser.ico");
    } else if (pauseStatus) {
      setDisplayRegisterStatus(" is Registered and Paused");
      setUserAvatar("userPause");
    } else {
      setDisplayRegisterStatus(" is Registered");
      setUserAvatar("userRegistered");
    }
  }, [isRegister, pauseStatus]);
  useEffect(() => {
    if (window.Worker) {
      console.log("window.Worker");
      setSupporWorker("support worker");
    } else {
      console.log("no window.Worker");
      setSupporWorker("no support worker");
    }
  }, []);
  return (
    <>
      {/* <FontAwesomeIcon icon="fa-solid fa-house" />
    <FontAwesomeIcon icon="fa-solid fa-user" />
    <FontAwesomeIcon icon="fa-solid fa-square-phone-flip" />
    <FontAwesomeIcon icon="fa-solid fa-phone" />
    <FontAwesomeIcon icon="fa-solid fa-gear" />
    <FontAwesomeIcon icon="fa-solid fa-gears" />
    <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
    <FontAwesomeIcon icon="fa-solid fa-xmark" /> */}

      <div className="Header">
        <div className="Header_UserInfo">
          <div className="Header_UserInfo_Avatar">
            <FontAwesomeIcon icon={"fa-solid fa-user"} className={userAvatar} />
          </div>
          <div className="Header_UserInfo_Status">
            <span className="Header_UserInfo_Status_PhoneNumber">
              {user?.agents && user?.agents[0].name}
            </span>
            <span className="Header_UserInfo_Status_Subtitle">
              [{displayExt(user?.agents && user?.agents[0]?.endpoint_id)}] :{" "}
              {displayRegisterStatus}
            </span>
            <span className="Header_UserInfo_Status_Subtitle">{curIP}</span>
          </div>
        </div>
        <div className="Header_Settings" onClick={handleShowSettingMenu}>
          <FontAwesomeIcon icon={"fa-solid fa-gears"} />
        </div>
      </div>
      {showSettingMenu?<PermistionMemu/>:!isOnCall &&<CallToForm />}
      
      
      
      {/* <div>Home1</div>
      <FontAwesomeIcon icon={faEnvelope} />

      <RegisterStatus />
      <PhonePad /> */}
      {/* <WindowCallOut/> */}
      {/* <button onClick={() => removeLoginStatus()}>Logout</button>
      <button onClick={() => console.log(user)}>user</button> */}
    </>
  );
}

export default Home;
