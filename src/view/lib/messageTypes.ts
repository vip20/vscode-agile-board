export type MessageType =
  | 'RELOAD'
  | 'COMMON'
  | 'alert'
  | 'refactor'
  | 'updateJson'
  | 'fetchJson'
  | 'renameBoard'
  | 'allDirectories'
  | 'addTaskFile'
  | 'openTaskFile'
  | 'deleteFiles'
  | 'priorityColors'
  | 'reFetchSettings'
  | 'reFetchConfig'
  | 'boardInitialized';

export interface Message {
  type: MessageType;
  payload?: any;
}

export interface CommonMessage extends Message {
  type: 'COMMON';
  payload: string;
}

export interface ReloadMessage extends Message {
  type: 'RELOAD';
}
