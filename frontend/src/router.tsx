import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import PrivateLayout from './components/layout/PrivateLayout';

// Public pages
import Home from './pages/public/Home';
import Blog from './pages/public/Blog';
import Login from './pages/public/Login';

// Private pages
import Dashboard from './pages/private/Dashboard';
import Habits from './pages/private/Habits';
import Subscriptions from './pages/private/Subscriptions';
import Media from './pages/private/Media';
import Knowledge from './pages/private/Knowledge';
import Tools from './pages/private/Tools';
import Settings from './pages/private/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'blog', element: <Blog /> },
      { path: 'login', element: <Login /> },
    ],
  },
  {
    path: '/app',
    element: <PrivateLayout />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'habits', element: <Habits /> },
      { path: 'subs', element: <Subscriptions /> },
      { path: 'media', element: <Media /> },
      { path: 'knowledge', element: <Knowledge /> },
      { path: 'tools', element: <Tools /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);
