import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RuneLoader } from './components/effects';
import { Sidebar } from './components/layout';
import { ParticleBackground } from './components/effects';

const HomePage = lazy(() => import('./pages/HomePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const PromptsPage = lazy(() => import('./pages/PromptsPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ApisPage = lazy(() => import('./pages/ApisPage'));

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen ml-64">
      <RuneLoader size="lg" />
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ParticleBackground />
      <Sidebar />
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
    </>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/chat', element: <Layout><ChatPage /></Layout> },
  { path: '/prompts', element: <Layout><PromptsPage /></Layout> },
  { path: '/documents', element: <Layout><DocumentsPage /></Layout> },
  { path: '/tasks', element: <Layout><TasksPage /></Layout> },
  { path: '/settings', element: <Layout><SettingsPage /></Layout> },
  { path: '/apis', element: <Layout><ApisPage /></Layout> },
]);
