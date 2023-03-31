import React, { useContext } from 'react';
import { MessagesContext } from '../context/MessageContext';

export const ReceivedMessages = () => {
  const receivedMessages = useContext(MessagesContext);
  console.log(receivedMessages);

  return (
    <div>
      <p>Received Messages from Extension:</p>
      <ul>
        {receivedMessages.map((receivedMessage, i) => (
          <li key={i}>{receivedMessage}</li>
        ))}
      </ul>
    </div>
  );
};
