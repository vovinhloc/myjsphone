import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
// import loginSlice from "../../src/redux/loginSlice";

const checkLoginStatusInLocalStorage = () => {
  if (localStorage.getItem(process.env.REACT_APP_LSTOKEN)) {
    return true;
  } else {
    return false;
  }
};

// const setLoginStatus = () => {
//   const dispatch = useDispatch();
//   dispatch(
//     loginSlice.actions.setLogin({
//       isLogined: checkLoginStatusInLocalStorage(),
//     })
//   );
// };
const saveLoginStatus = (value) => {
  localStorage.setItem(process.env.REACT_APP_LSTOKEN, value);
  // setLoginStatus();
};
const removeLoginStatus = () => {
  localStorage.removeItem(process.env.REACT_APP_LSTOKEN);
  // setLoginStatus();
};

const axiosi = axios.create({
  baseURL: process.env.REACT_APP_DOMAIN,
  withCredentials: true,
});
const doRefreshLogin = async (config) => {
  console.log("begin doing doRefreshLogin  ");
  config.url = "refreshLogin";
  const kq = await axiosi(config);
  console.log("kq doRefreshLogin ::::", kq.data);
  if (kq.data.error) {
    return false;
  } else return true;
};

axiosi.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    console.log("response:::", response);

    if (response.data.error) {
      if (response.data.error.name) {
        if (
          response.data.error.name === "No token" ||
          response.data.error.name === "TokenExpiredError"
        ) {
          const config = response.config;
          if (doRefreshLogin(config)) {
            return axiosi(config);
          }
        }
      }
    }
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log("error:::", error);
    return Promise.reject(error);
  }
);

export { checkLoginStatusInLocalStorage, axiosi };
