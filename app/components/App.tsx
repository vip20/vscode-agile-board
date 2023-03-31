import React, { useEffect, useState, useCallback, useRef } from 'react';
import { CommonMessage, Message, ReloadMessage } from '../../src/view/lib/messageTypes';
import { PriorityColorsProvider } from '../context/priorityColors';
import './App.scss';
import { Board } from './Board';
import { defaultBoardConfig } from '../../src/core/constants';
import * as t from '../../src/core/types';
import { ResponsiveProvider } from '../hooks/useResponsive';

export const App = () => {
  const [messagesFromExtension, setMessagesFromExtension] = useState<string[]>([]);

  const [configJson, _setConfigJson] = useState(defaultBoardConfig);
  const [allDirectories, _setAllDirectories] = useState<string[]>([]);
  const configRef = useRef<t.Board>(configJson);
  const dirRef = useRef<string[]>(allDirectories);

  const setConfigJson = (data: t.Board) => {
    configRef.current = data;
    _setConfigJson(configRef.current);
  };
  const setAllDirectories = (data: string[]) => {
    dirRef.current = data;
    _setAllDirectories(dirRef.current);
  };
  useEffect(() => {
    vscode.postMessage({
      type: 'boardInitialized',
    });
  }, []);
  const handleMsgEvent = useCallback((event: any) => {
    const message: Message = event.data;
    if (message.type && message.payload?.data) {
      switch (message.type) {
        case 'fetchJson':
          setConfigJson(message.payload.data);
          break;
        case 'allDirectories':
          setAllDirectories(message.payload.data);
          break;
      }
    }
  }, []);
  useEffect(() => {
    window.addEventListener('message', handleMsgEvent);
    // clean up
    return () => window.removeEventListener('message', event => handleMsgEvent);
  }, [handleMsgEvent]);
  const handleMessagesFromExtension = useCallback(
    (event: MessageEvent<Message>) => {
      if (event.data.type === 'COMMON') {
        const message = event.data as CommonMessage;
        setMessagesFromExtension([...messagesFromExtension, message.payload]);
      }
    },
    [messagesFromExtension]
  );

  useEffect(() => {
    window.addEventListener('message', (event: MessageEvent<Message>) => {
      handleMessagesFromExtension(event);
    });

    return () => {
      window.removeEventListener('message', handleMessagesFromExtension);
    };
  }, [handleMessagesFromExtension]);

  return (
    // <Router initialEntries={['/']}>
    //   <MessagesContext.Provider value={messagesFromExtension}>
    //     <PriorityColorsProvider>
    //       <Switch>
    //         {routes.map((route, i) => (
    //           <RouteWithSubRoutes key={i} {...route} />
    //         ))}
    //       </Switch>
    //     </PriorityColorsProvider>
    //   </MessagesContext.Provider>
    // </Router>

    <ResponsiveProvider>
      <PriorityColorsProvider>
        <Board configJson={configJson} allDirectoryNames={allDirectories}></Board>
      </PriorityColorsProvider>
    </ResponsiveProvider>
  );
};
