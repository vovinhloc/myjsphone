import { createSlice } from "@reduxjs/toolkit";

// Load Audio Files
var audioFiles = [
  { type: "Ring", fileName: "./media/Ringtone_1.mp3" },
  { type: "Alert", fileName: "./media/Alert.mp3" },
  { type: "End", fileName: "./media/Tone_Congestion-US.mp3" },
];
var audioPlayers = audioFiles.reduce((player, file) => {
  player[file.type] = new Audio(file.fileName);
  player[file.type].loop = true;
  return player;
}, {});

const initialState = {
  isRegister: false,
  coolPhone: null,
  mysession: {},
  callInfo_Ticket: {},
  makeCall: null,
  answer: null,
  hangUp: null,
  audioPlayers,
  provinceData: null,
};
const jsSIPSlice = createSlice({
  name: "jsSIP",
  initialState,
  reducers: {
    setprovinceDataRedux(state, action) {
      state.provinceData = action.payload;
    },
    addCallInfo_Ticket(state, action) {
      console.log(
        "[jsSIPSlice-addCallInfo_Ticket]:action.payload=",
        action.payload
      );
      console.log(
        "[jsSIPSlice-addCallInfo_Ticket]: state.callInfo_Ticket=",
        state.callInfo_Ticket
      );
      console.log(
        "[jsSIPSlice-addCallInfo_Ticket]:action.payload.call_id=",
        action.payload.call_id
      );
      state.callInfo_Ticket[action.payload.id] = {};
      state.callInfo_Ticket[action.payload.id] = action.payload;
      // state.callInfo_Ticket[action.payload.id]["call_id"] =
      //   action.payload.call_id;
    },
    delCallInfo_Ticket(state, action) {
      // const preCallInfo_Ticket=state.callInfo_Ticket;
      // delete preCallInfo_Ticket[action.payload.id];
      console.log(
        "[jsSIPSlice-delCallInfo_Ticket]:action.payload=",
        action.payload
      );
      delete state.callInfo_Ticket[action.payload.id];
    },
    setRegisterStatus(state, action) {
      state.isRegister = action.payload.isRegister;
    },
    registerCollPhone(state, action) {
      console.log("register registerCollPhone");
      state.coolPhone = action.payload;
    },

    registerMakeCall(state, action) {
      console.log("register makecall");
      state.makeCall = action.payload;
    },
    registerAnswer(state, action) {
      console.log("register registerAnswer");
      state.answer = action.payload;
    },
    registerHangup(state, action) {
      console.log("register hangup");
      state.hangup = action.payload;
    },
  },
});

export const {
  setRegisterStatus,
  registerCollPhone,
  registerMakeCall,
  registerAnswer,
  registerHangup,
  addCallInfo_Ticket,
  delCallInfo_Ticket,
  setprovinceDataRedux,
} = jsSIPSlice.actions;
export default jsSIPSlice.reducer;
