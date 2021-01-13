import { QuickPickItem } from "vscode";
export interface Task {
  id: string;
  createdDate?: string;
  modifiedDate?: string;
  description: string;
  title: string;
  files: string[];
  priority?: number;
}

export interface Column {
  id: string;
  title: string;
  tasksIds: string[];
  isDefault: boolean;
  createdDate?: string;
  modifiedDate?: string;
}

export interface Board {
  boardName: string;
  createdDate: string;
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnsOrder: string[];
}
export interface QuickPickParameters<T extends QuickPickItem> {
  title: string;
  items: T[];
  activeItem?: T;
  placeholder: string;
  defaultItems?: T[];
}

export interface DropdownItem {
  leftIcon?: JSX.Element | string;
  rightIcon?: JSX.Element | string;
  goToMenu?: string;
  callbackFn?: Function;
  isDisabled?: boolean;
  transparentOnHover?: boolean;
  children: JSX.Element | string;
}
export interface DropdownMenu {
  primary: { main: DropdownItem[] };
  secondary?: { [key: string]: DropdownItem[] };
}
