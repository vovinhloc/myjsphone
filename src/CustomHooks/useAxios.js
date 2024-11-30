import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import loginSlice from "../../src/redux/loginSlice";

const checkLoginStatusInLocalStorage = () => {
  if (localStorage.getItem(process.env.REACT_APP_LSTOKEN)) {
    return true;
  } else {
    return false;
  }
};

export default function useAxios() {
  const user = useSelector((state) => state.loginReducer.user);
  const dispatch = useDispatch();

  const instance = axios.create({
    baseURL: process.env.DOMAIN,
    withCredentials: true,
  });
  const doRefreshLogin = async (config) => {
    
    config.url = `${process.env.DOMAIN}/users/refreshLogin`;
    let ketqua = true;
    try {
      const kq = await axios.post(config.url, {}, { withCredentials: true });
      
      if (!user.agents) {
        dispatch(loginSlice.actions.setUser({ user: kq.data }));
      }
      if (kq.data.error) {
        ketqua = false;
      }
    } catch {
      ketqua = false;
    }
    
    return ketqua;
  };

  instance.interceptors.response.use(
    async function (response) {     

      if (response.data.type === "application/json") {        
        const kqtext = JSON.parse(await response.data.text());        
        response.data = kqtext;
      }

      if (response.data.error) {
        if (response.data.error.name) {
          if (
            response.data.error.name === "No token" ||
            response.data.error.name === "TokenExpiredError"
          ) {
            const config = response.config;
            if (config.url === "users/refreshLogin") {
              localStorage.removeItem(process.env.REACT_APP_LSTOKEN);
              dispatch(
                loginSlice.actions.setLogin({
                  isLogined: checkLoginStatusInLocalStorage(),
                })
              );
              
              return response;
            }
            
            const kq = await doRefreshLogin({ ...config });
            
            if (kq) {
              
              config.withCredentials = true;
              return instance(config);
            } else {
              //console.log("Here2...............................");
              localStorage.removeItem(process.env.REACT_APP_LSTOKEN);
              dispatch(
                loginSlice.actions.setLogin({
                  isLogined: checkLoginStatusInLocalStorage(),
                })
              );
              //console.log("Here3...............................");
              // return Promise.reject(response);
              return response;
            }
          }
        }
      }
      return response;
    },
    function (error) {      
      return Promise.reject(error);
    }
  );

  return { axiosi: instance };
}
