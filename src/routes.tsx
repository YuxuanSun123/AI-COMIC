import { lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const Studio = lazy(() => import('./pages/Studio'));
const ScriptGenerator = lazy(() => import('./pages/tools/ScriptGenerator'));
const StoryboardGenerator = lazy(() => import('./pages/tools/StoryboardGenerator'));
const VideoCards = lazy(() => import('./pages/tools/VideoCards'));
const Editing = lazy(() => import('./pages/tools/Editing'));
const ExternalToolsPage = lazy(() => import('./pages/tools/ExternalToolsPage'));
const Links = lazy(() => import('./pages/Links'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ApiTest = lazy(() => import('./pages/ApiTest'));
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />
  },
  {
    name: 'News',
    path: '/news',
    element: <News />
  },
  {
    name: 'NewsDetail',
    path: '/news/:id',
    element: <NewsDetail />
  },
  {
    name: 'Studio',
    path: '/studio',
    element: <Studio />
  },
  {
    name: 'ScriptGenerator',
    path: '/tools/script',
    element: <ScriptGenerator />
  },
  {
    name: 'StoryboardGenerator',
    path: '/tools/storyboard',
    element: <StoryboardGenerator />
  },
  {
    name: 'VideoCards',
    path: '/tools/video_cards',
    element: <VideoCards />
  },
  {
    name: 'AssetEditor',
    path: '/tools/assets',
    element: <Editing />
  },
  {
    name: 'ExternalTools',
    path: '/tools/external',
    element: <ExternalToolsPage />
  },
  {
    name: 'Links',
    path: '/links',
    element: <Links />
  },
  {
    name: 'Pricing',
    path: '/pricing',
    element: <Pricing />
  },
  {
    name: 'About',
    path: '/about',
    element: <About />
  },
  {
    name: 'Contact',
    path: '/contact',
    element: <Contact />
  },
  {
    name: 'Privacy',
    path: '/privacy',
    element: <Privacy />
  },
  {
    name: 'Terms',
    path: '/terms',
    element: <Terms />
  },
  {
    name: 'ApiTest',
    path: '/api-test',
    element: <ApiTest />
  },
  {
    name: 'Disclaimer',
    path: '/disclaimer',
    element: <Disclaimer />
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <Admin />
  },
  {
    name: 'NotFound',
    path: '*',
    element: <NotFound />
  }
];

export default routes;
