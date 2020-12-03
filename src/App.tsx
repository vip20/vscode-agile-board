import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import Board from "./components/board";
import { defaultBoardConfig } from "./core/constants";
import * as types from "./core/types";

export default function App() {
  const [configJson, _setConfigJson] = useState(defaultBoardConfig);
  const configRef = useRef<types.Board>(configJson);

  const setConfigJson = (data: types.Board) => {
    configRef.current = data;
    _setConfigJson(configRef.current);
  };

  const handleMsgEvent = useCallback((event: any) => {
    const message = event.data;
    if (message.command && message.data) {
      switch (message.command) {
        case "configJson":
          setConfigJson(message.data);
          break;
      }
    }
  }, []);
  useEffect(() => {
    window.addEventListener("message", handleMsgEvent);
    // clean up
    return () =>
      window.removeEventListener("message", (event) => handleMsgEvent);
  }, [handleMsgEvent]);

  return (
    <>
      <Board configJson={configJson}></Board>
    </>
  );
}
