import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { library } from '@fortawesome/fontawesome-svg-core'

import { fas } from '@fortawesome/free-solid-svg-icons'
library.add(fas)
import App from "./App.jsx";
import "./index.css";
import { store } from "./redux/store";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  // </React.StrictMode>
);
