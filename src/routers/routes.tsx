import { InfoCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { lazy } from 'react';
import type { RouteObject } from 'react-router';

export type RouteMeta = {
  title: string;
  icon?: React.ReactNode;
  hideInMenu?: boolean;
};

export type AppRoute = RouteObject & {
  meta?: RouteMeta;
  children?: AppRoute[];
};

export const routes: AppRoute[] = [
  {
    index: true,
    meta: { title: '列表', icon: <ReadOutlined /> },
    Component: lazy(() => import('@/pages/home')),
  },
  {
    path: 'about',
    meta: { title: '关于', icon: <InfoCircleOutlined /> },
    Component: lazy(() => import('@/pages/about')),
  },
];
