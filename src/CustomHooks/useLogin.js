// import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import loginSlice from "../../src/redux/loginSlice";

const checkLoginStatusInLocalStorage = () => {
  if (localStorage.getItem(process.env.REACT_APP_LSTOKEN)) {
    return true;
  } else {
    return false;
  }
};
export default function useLogin() {
  let isLogined = useSelector((state) => state.loginReducer.isLogined);
  const dispatch = useDispatch();

  const saveLoginStatus = (value) => {
    localStorage.setItem(process.env.REACT_APP_LSTOKEN, value);
    dispatch(
      loginSlice.actions.setLogin({
        isLogined: checkLoginStatusInLocalStorage(),
      })
    );
  };
  const removeLoginStatus = () => {
    localStorage.removeItem(process.env.REACT_APP_LSTOKEN);
    dispatch(
      loginSlice.actions.setLogin({
        isLogined: checkLoginStatusInLocalStorage(),
      })
    );
  };

  return {
    isLogined,
    saveLoginStatus,
    removeLoginStatus,
  };
}
