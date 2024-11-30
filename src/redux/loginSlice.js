import { createSlice } from "@reduxjs/toolkit";
import { checkLoginStatusInLocalStorage } from "../../src/mylibs/list1";
const initialState = {
  isLogined: checkLoginStatusInLocalStorage(),
  endpointid: "",
  webrtc: "",
  endpoint: { id: "", pass: "" },
  user: {},
  hideItem: "hideItem",
  enableDebug: 0,
};
// if (localStorage.getItem("loginStatus")) {
//   initialState.isLogined = true;
// } else {
//   initialState.isLogined = false;
// }
const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setEnableDebug(state,action){
      state.enableDebug = action.payload.enableDebug
    },
    setLogin(state, action) {
      // console.log({ action });
      // console.log(action.payload.isLogined);
      state.isLogined = action.payload.isLogined;
    },
    setEndpoint(state, action) {
      state.endpoint = action.payload.endpoint;
    },
    setUser(state, action) {
      
      if (state.user !== "") {
        state.user = action.payload.user;
        
        state.endpointid = action.payload.user.agents[0].endpoint_id;
        state.webrtc = action.payload.user.agents[0].webrtc;

        if (action.payload.user.agents[0].company_id == 1) {
          state.hideItem = "col";
        }
      } else {
        console.log("[redux setUser] : Da co' nen kg save user nua!");
      }
    },
    setWebrtc(state, action) {
      state.webrtc = action.payload.webrtc;
    },
  },
});

export default loginSlice;
