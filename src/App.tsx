import * as React from "react";
import "./App.css";
import Board from "./components/board";
import { defaultBoardConfig } from "./core/constants";

export default function App() {
  const [configJson, setConfigJson] = React.useState(defaultBoardConfig);
  window.addEventListener("message", (event) => {
    //TODO some issue here
    console.log(event);
    const message = event.data;
    switch (message.command) {
      case "configJson":
        setConfigJson(message.data);
        break;
    }
  });

  return (
    <>
      <Board configJson={configJson}></Board>
    </>
  );
}
