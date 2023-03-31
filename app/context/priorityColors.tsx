import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useCallback } from 'react';
import { PRIORITY_COLORS } from '../../src/core/constants';
import { Message } from '../../src/view/lib/messageTypes';

export const PriorityColorsContext = React.createContext<any>([]);

export const PriorityColorsProvider = (props: any) => {
  const [priorityColors, _setPriorityColors] = React.useState(PRIORITY_COLORS);

  const priorityColorsRef = useRef<string[]>(priorityColors);
  const setPriorityColors = (data: string[]) => {
    priorityColorsRef.current = data;
    _setPriorityColors(priorityColorsRef.current);
  };

  const handleMsgEvent = useCallback((event: any) => {
    const message: Message = event.data;
    if (message.type && message.payload?.data) {
      switch (message.type) {
        case 'priorityColors':
          setPriorityColors(message.payload.data);
          break;
      }
    }
  }, []);
  useEffect(() => {
    window.addEventListener('message', handleMsgEvent);
    // clean up
    return () => window.removeEventListener('message', event => handleMsgEvent);
  }, [handleMsgEvent]);
  return (
    <PriorityColorsContext.Provider value={[priorityColors]}>
      {props.children}
    </PriorityColorsContext.Provider>
  );
};
