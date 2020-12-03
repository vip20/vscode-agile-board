import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Board } from "./core/types";
import "./index.css";

declare global {
  interface Window {
    configJson: Board;
    acquireVsCodeApi(): any;
  }
}

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
