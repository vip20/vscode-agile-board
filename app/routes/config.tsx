import React from 'react';
import { Board } from '../components/Board';

export type RouteConfigComponentProps = Pick<RouteConfig, 'routes'>;

export type RouteConfig = {
  path: string;
  component: React.ComponentType<RouteConfigComponentProps>;
  exact?: boolean;
  routes?: RouteConfig[];
};

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: Board,
    exact: true,
  },
];
