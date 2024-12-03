import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import "../../login.css";
import loginSlice from "../../../src/redux/loginSlice";
import useLogin from "../../../src/CustomHooks/useLogin";

function Login() {
  const [userName, setUserName] = useState(process.env.USERNAME);
  // const [passWord, setPassWord] = useState("");
  const { saveLoginStatus, removeLoginStatus } = useLogin();
  const dispatch = useDispatch();
  const loginHandle = async (event) => {
    event.preventDefault();
    const userName = event.target.userName.value;
    const passWord = event.target.passWord.value;

    console.log("Username:", userName);
    console.log("Password:", passWord);
    1;
    // console.log(event.target);
    // return;

    // console.log("[Login]:done onFinish");
    const userlogin = { username: userName, password: passWord };
    const kq = await axios.post(
      `${process.env.DOMAIN}/users/login`,
      userlogin,
      { withCredentials: true }
    );
    console.log("[Login]:done /users/login");
    if (kq.data.code === 200) {
      saveLoginStatus("1");
      console.log("[Login]:kq.data=", kq.data);
      dispatch(
        loginSlice.actions.setWebrtc({ webrtc: kq.data.agents[0].webrtc })
      );
      dispatch(loginSlice.actions.setUser({ user: kq.data }));
    } else {
      console.log("[Login]:khac 200");
      removeLoginStatus();
    }

    console.log("done handlelogin");
  };
  return (
    <>
      <div className="containerColumn">
        <h1 className="textCenter">Login</h1>
        <form
          className="containerColumn LoginForm fontLarge"
          onSubmit={loginHandle}
        >
          <div className="LoginForm-Item">
            <label htmlFor="userName" className="LoginForm-Item-Label">
              UserName :
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              className="LoginForm-Item-Input"
              defaultValue={userName}
            />
          </div>
          <div className="LoginForm-Item">
            <label htmlFor="passWord" className="LoginForm-Item-Label">
              Password :
            </label>
            <input
              type="password"
              id="passWord"
              name="passWord"
              className="LoginForm-Item-Input"
              defaultValue={""}
            />
          </div>
          <div className="LoginForm-Item">
            <label className="LoginForm-Item-Label"></label>
            <button className="LoginForm-Item-Button" type="submit">
              Login
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Login;
