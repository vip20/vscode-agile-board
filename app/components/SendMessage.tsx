import React, { useContext, useState } from 'react';
import { CommonMessage } from '../../src/view/lib/messageTypes';
import { MessagesContext } from '../context/MessageContext';

export const SendMessage = () => {
  const [message, setMessage] = useState('');
  const receivedMessages = useContext(MessagesContext);
  console.log(receivedMessages);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const sendMessage = () => {
    vscode.postMessage<CommonMessage>({
      type: 'COMMON',
      payload: message,
    });
  };

  return (
    <div>
      <p>Send Message to Extension:</p>
      <input value={message} onChange={handleMessageChange} />
      <button onClick={sendMessage}>Send</button>

      <div>
        <p>Received Messages from Extension:</p>
        <ul>
          {receivedMessages.map((receivedMessage, i) => (
            <li key={i}>{receivedMessage}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
