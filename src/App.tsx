import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import Board from "./components/board";
import { ACTION, defaultBoardConfig } from "./core/constants";
import * as types from "./core/types";
import { ResponsiveProvider } from "./hooks/useResponsive";
declare const vscodeApi: any;
export default function App() {
  const [configJson, _setConfigJson] = useState(defaultBoardConfig);
  const [allDirectories, _setAllDirectories] = useState<string[]>([]);
  const configRef = useRef<types.Board>(configJson);
  const dirRef = useRef<string[]>(allDirectories);

  const setConfigJson = (data: types.Board) => {
    configRef.current = data;
    _setConfigJson(configRef.current);
  };
  const setAllDirectories = (data: string[]) => {
    dirRef.current = data;
    _setAllDirectories(dirRef.current);
  };

  const handleMsgEvent = useCallback((event: any) => {
    const message = event.data;
    if (message.action && message.data) {
      switch (message.action) {
        case ACTION.fetchJson:
          setConfigJson(message.data);
          break;
        case ACTION.allDirectories:
          setAllDirectories(message.data);
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
      <ResponsiveProvider>
        <Board
          configJson={configJson}
          vscodeApi={vscodeApi}
          allDirectoryNames={allDirectories}
        ></Board>
      </ResponsiveProvider>
    </>
  );
}
