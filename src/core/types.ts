export interface Task {
  id: string;
  createdDate: string;
  modifiedDate: string;
  description: string;
}

export interface Column {
  id: string;
  title: string;
  tasksIds: string[];
}

export interface Board {
  boardName: string;
  createdDate: string;
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnsOrder: string[];
}
